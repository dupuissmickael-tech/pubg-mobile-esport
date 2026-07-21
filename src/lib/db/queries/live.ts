import {and, asc, desc, eq, gte, inArray, lte} from 'drizzle-orm';
import {getDb, hasDatabase} from '..';
import {matchResults, matches, teams, tournamentTeams, tournaments} from '../schema';
import {demoLiveState, demoMatches} from '@/lib/demo-data';
import type {
  LiveState,
  MatchResultRow,
  MatchView,
  MatchWithResults,
  StandingRow
} from '@/lib/types';

const teamSummarySelection = {
  id: teams.id,
  slug: teams.slug,
  name: teams.name,
  logoUrl: teams.logoUrl,
  region: teams.region,
  orgName: teams.orgName
};

const matchViewSelection = {
  id: matches.id,
  tournamentId: matches.tournamentId,
  tournamentSlug: tournaments.slug,
  tournamentName: tournaments.name,
  stage: matches.stage,
  matchNumber: matches.matchNumber,
  map: matches.map,
  scheduledAt: matches.scheduledAt,
  status: matches.status,
  streamUrl: matches.streamUrl
};

function toMatchView(row: {
  [K in keyof typeof matchViewSelection]: unknown;
}): MatchView {
  const r = row as Record<string, unknown>;
  return {
    ...(r as unknown as Omit<MatchView, 'scheduledAt' | 'streamUrl'>),
    scheduledAt: (r.scheduledAt as Date).toISOString(),
    streamUrl: (r.streamUrl as string | null) ?? null
  };
}

/** The match currently marked live, if any (for the home page banner). */
export async function getLiveMatch(): Promise<MatchView | null> {
  if (!hasDatabase()) {
    const live = demoMatches().find((m) => m.status === 'live');
    return live ?? null;
  }
  const db = getDb();
  const [row] = await db
    .select(matchViewSelection)
    .from(matches)
    .innerJoin(tournaments, eq(matches.tournamentId, tournaments.id))
    .where(eq(matches.status, 'live'))
    .orderBy(desc(matches.scheduledAt))
    .limit(1);
  return row ? toMatchView(row) : null;
}

/** Matches scheduled (or live) within the next 48 hours. */
export async function getUpcomingMatches(): Promise<MatchView[]> {
  const nowMs = Date.now();
  const horizon = new Date(nowMs + 48 * 3600_000);

  if (!hasDatabase()) {
    return demoMatches()
      .filter(
        (m) =>
          (m.status === 'scheduled' || m.status === 'live') &&
          new Date(m.scheduledAt) <= horizon &&
          new Date(m.scheduledAt).getTime() >= nowMs - 3 * 3600_000
      )
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  }

  const db = getDb();
  const rows = await db
    .select(matchViewSelection)
    .from(matches)
    .innerJoin(tournaments, eq(matches.tournamentId, tournaments.id))
    .where(
      and(
        inArray(matches.status, ['scheduled', 'live']),
        gte(matches.scheduledAt, new Date(nowMs - 3 * 3600_000)),
        lte(matches.scheduledAt, horizon)
      )
    )
    .orderBy(asc(matches.scheduledAt));
  return rows.map(toMatchView);
}

/**
 * Full live view: the ongoing tournament, its overall standings and the
 * per-match points breakdown. Always served from the local database, so the
 * latest known state remains available even if the upstream API is down.
 */
export async function getLiveState(): Promise<LiveState | null> {
  if (!hasDatabase()) {
    return demoLiveState();
  }

  const db = getDb();
  const [tournament] = await db
    .select()
    .from(tournaments)
    .where(eq(tournaments.status, 'ongoing'))
    .orderBy(asc(tournaments.startDate))
    .limit(1);
  if (!tournament) return null;

  const standingsRows = await db
    .select({
      team: teamSummarySelection,
      totalPoints: tournamentTeams.totalPoints,
      totalKills: tournamentTeams.totalKills
    })
    .from(tournamentTeams)
    .innerJoin(teams, eq(tournamentTeams.teamId, teams.id))
    .where(eq(tournamentTeams.tournamentId, tournament.id))
    .orderBy(desc(tournamentTeams.totalPoints), desc(tournamentTeams.totalKills));

  const matchRows = await db
    .select(matchViewSelection)
    .from(matches)
    .innerJoin(tournaments, eq(matches.tournamentId, tournaments.id))
    .where(
      and(
        eq(matches.tournamentId, tournament.id),
        inArray(matches.status, ['completed', 'live'])
      )
    )
    .orderBy(desc(matches.scheduledAt));

  const matchIds = matchRows.map((m) => m.id as string);
  const resultRows = matchIds.length
    ? await db
        .select({
          matchId: matchResults.matchId,
          team: teamSummarySelection,
          placement: matchResults.placement,
          kills: matchResults.kills,
          placementPoints: matchResults.placementPoints,
          killPoints: matchResults.killPoints,
          totalPoints: matchResults.totalPoints
        })
        .from(matchResults)
        .innerJoin(teams, eq(matchResults.teamId, teams.id))
        .where(inArray(matchResults.matchId, matchIds))
        .orderBy(asc(matchResults.placement))
    : [];

  const resultsByMatch = new Map<string, MatchResultRow[]>();
  const playedByTeam = new Map<string, number>();
  for (const r of resultRows) {
    const list = resultsByMatch.get(r.matchId) ?? [];
    list.push({
      team: r.team,
      placement: r.placement,
      kills: r.kills,
      placementPoints: r.placementPoints,
      killPoints: r.killPoints,
      totalPoints: r.totalPoints
    });
    resultsByMatch.set(r.matchId, list);
    playedByTeam.set(r.team.id, (playedByTeam.get(r.team.id) ?? 0) + 1);
  }

  const standings: StandingRow[] = standingsRows.map((row, i) => ({
    rank: i + 1,
    team: row.team,
    matchesPlayed: playedByTeam.get(row.team.id) ?? 0,
    totalKills: row.totalKills,
    totalPoints: row.totalPoints
  }));

  const liveMatches: MatchWithResults[] = matchRows.map((m) => ({
    ...toMatchView(m),
    results: resultsByMatch.get(m.id as string) ?? []
  }));

  return {
    tournament: {
      id: tournament.id,
      slug: tournament.slug,
      name: tournament.name,
      tier: tournament.tier,
      region: tournament.region,
      startDate: tournament.startDate,
      endDate: tournament.endDate,
      prizePool: tournament.prizePool ? Number(tournament.prizePool) : null,
      prizeCurrency: tournament.prizeCurrency,
      status: tournament.status,
      streamUrl: tournament.streamUrl,
      teamCount: standings.length
    },
    standings,
    matches: liveMatches
  };
}
