import {and, asc, desc, eq, sql} from 'drizzle-orm';
import {getDb, hasDatabase} from '..';
import {safeQuery} from '../safe-query';
import {teams, tournamentTeams, tournaments} from '../schema';
import {demoTournamentDetail, demoTournaments} from '@/lib/demo-data';
import type {
  Region,
  Tier,
  TournamentDetail,
  TournamentStatus,
  TournamentSummary
} from '@/lib/types';
import {applyTranslation, loadTranslations} from './translate';

export interface TournamentFilters {
  region?: Region;
  tier?: Tier;
  status?: TournamentStatus;
}

const STATUS_ORDER: Record<TournamentStatus, number> = {
  ongoing: 0,
  upcoming: 1,
  completed: 2
};

function sortTournaments(list: TournamentSummary[]): TournamentSummary[] {
  return [...list].sort((a, b) => {
    const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (byStatus !== 0) return byStatus;
    // Upcoming: soonest first; completed: most recent first
    return a.status === 'completed'
      ? b.endDate.localeCompare(a.endDate)
      : a.startDate.localeCompare(b.startDate);
  });
}

export async function listTournaments(
  filters: TournamentFilters,
  locale: string
): Promise<TournamentSummary[]> {
  let list: TournamentSummary[];

  if (!hasDatabase()) {
    list = demoTournaments().filter(
      (t) =>
        (!filters.region || t.region === filters.region) &&
        (!filters.tier || t.tier === filters.tier) &&
        (!filters.status || t.status === filters.status)
    );
  } else {
    list = await safeQuery(async () => {
      const db = getDb();
      const conditions = [];
      if (filters.region) conditions.push(eq(tournaments.region, filters.region));
      if (filters.tier) conditions.push(eq(tournaments.tier, filters.tier));
      if (filters.status) conditions.push(eq(tournaments.status, filters.status));

      const rows = await db
        .select({
          id: tournaments.id,
          slug: tournaments.slug,
          name: tournaments.name,
          tier: tournaments.tier,
          region: tournaments.region,
          startDate: tournaments.startDate,
          endDate: tournaments.endDate,
          prizePool: tournaments.prizePool,
          prizeCurrency: tournaments.prizeCurrency,
          status: tournaments.status,
          streamUrl: tournaments.streamUrl,
          teamCount: sql<number>`(
            select count(*)::int from ${tournamentTeams}
            where ${tournamentTeams.tournamentId} = ${tournaments.id}
          )`
        })
        .from(tournaments)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(tournaments.startDate));

      return rows.map((r) => ({...r, prizePool: r.prizePool ? Number(r.prizePool) : null}));
    }, []);
  }

  const translated = await loadTranslations(
    'tournament',
    list.map((t) => t.id),
    locale
  );
  return sortTournaments(
    list.map((t) => applyTranslation(t, translated, ['name']))
  );
}

export async function getTournamentDetail(
  slug: string,
  locale: string
): Promise<TournamentDetail | null> {
  let detail: TournamentDetail | null;

  if (!hasDatabase()) {
    detail = demoTournamentDetail(slug);
  } else {
    detail = await safeQuery(async () => {
      const db = getDb();
      const [row] = await db
        .select()
        .from(tournaments)
        .where(eq(tournaments.slug, slug))
        .limit(1);
      if (!row) return null;

      const participants = await db
        .select({
          id: teams.id,
          slug: teams.slug,
          name: teams.name,
          logoUrl: teams.logoUrl,
          region: teams.region,
          orgName: teams.orgName,
          seed: tournamentTeams.seed,
          finalRank: tournamentTeams.finalRank,
          totalPoints: tournamentTeams.totalPoints,
          totalKills: tournamentTeams.totalKills
        })
        .from(tournamentTeams)
        .innerJoin(teams, eq(tournamentTeams.teamId, teams.id))
        .where(eq(tournamentTeams.tournamentId, row.id))
        .orderBy(
          asc(sql`coalesce(${tournamentTeams.finalRank}, 999)`),
          desc(tournamentTeams.totalPoints)
        );

      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        tier: row.tier,
        region: row.region,
        startDate: row.startDate,
        endDate: row.endDate,
        prizePool: row.prizePool ? Number(row.prizePool) : null,
        prizeCurrency: row.prizeCurrency,
        status: row.status,
        streamUrl: row.streamUrl,
        format: row.format,
        teamCount: participants.length,
        teams: participants
      };
    }, null);
  }

  if (!detail) return null;
  const translated = await loadTranslations('tournament', [detail.id], locale);
  return applyTranslation(detail, translated, ['name', 'format']);
}

export async function getOngoingTournaments(): Promise<TournamentSummary[]> {
  return listTournaments({status: 'ongoing'}, 'en');
}
