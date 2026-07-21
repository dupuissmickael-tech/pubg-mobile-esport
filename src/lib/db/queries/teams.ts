import {asc, desc, eq, or} from 'drizzle-orm';
import {alias} from 'drizzle-orm/pg-core';
import {getDb, hasDatabase} from '..';
import {
  players,
  teams,
  tournamentTeams,
  tournaments,
  transfers
} from '../schema';
import {demoTeamDetail, demoTeams} from '@/lib/demo-data';
import type {TeamDetail, TeamSummary} from '@/lib/types';

export async function listTeams(): Promise<TeamSummary[]> {
  if (!hasDatabase()) {
    return demoTeams;
  }
  const db = getDb();
  return db
    .select({
      id: teams.id,
      slug: teams.slug,
      name: teams.name,
      logoUrl: teams.logoUrl,
      region: teams.region,
      orgName: teams.orgName
    })
    .from(teams)
    .where(eq(teams.isActive, true))
    .orderBy(asc(teams.name));
}

export async function getTeamDetail(slug: string): Promise<TeamDetail | null> {
  if (!hasDatabase()) {
    return demoTeamDetail(slug);
  }

  const db = getDb();
  const [team] = await db
    .select()
    .from(teams)
    .where(eq(teams.slug, slug))
    .limit(1);
  if (!team) return null;

  const roster = await db
    .select({
      id: players.id,
      nickname: players.nickname,
      realName: players.realName,
      role: players.role,
      countryCode: players.countryCode
    })
    .from(players)
    .where(eq(players.teamId, team.id))
    .orderBy(asc(players.nickname));

  const recentResults = await db
    .select({
      tournamentSlug: tournaments.slug,
      tournamentName: tournaments.name,
      endDate: tournaments.endDate,
      finalRank: tournamentTeams.finalRank,
      totalPoints: tournamentTeams.totalPoints
    })
    .from(tournamentTeams)
    .innerJoin(tournaments, eq(tournamentTeams.tournamentId, tournaments.id))
    .where(eq(tournamentTeams.teamId, team.id))
    .orderBy(desc(tournaments.endDate))
    .limit(10);

  const fromTeam = alias(teams, 'from_team');
  const toTeam = alias(teams, 'to_team');
  const transferRows = await db
    .select({
      id: transfers.id,
      playerNickname: players.nickname,
      fromTeamName: fromTeam.name,
      toTeamName: toTeam.name,
      transferDate: transfers.transferDate
    })
    .from(transfers)
    .innerJoin(players, eq(transfers.playerId, players.id))
    .leftJoin(fromTeam, eq(transfers.fromTeamId, fromTeam.id))
    .leftJoin(toTeam, eq(transfers.toTeamId, toTeam.id))
    .where(or(eq(transfers.fromTeamId, team.id), eq(transfers.toTeamId, team.id)))
    .orderBy(desc(transfers.transferDate))
    .limit(20);

  return {
    id: team.id,
    slug: team.slug,
    name: team.name,
    fullName: team.fullName,
    logoUrl: team.logoUrl,
    region: team.region,
    orgName: team.orgName,
    roster,
    recentResults,
    transfers: transferRows
  };
}
