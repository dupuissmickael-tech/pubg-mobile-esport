/**
 * Seeds a real PostgreSQL database with the bundled sample dataset
 * (same data the site shows in demo mode). Run with: npm run db:seed
 *
 * Idempotence: the script wipes and re-inserts sample rows, so it is meant
 * for a fresh development database — not for production.
 */
import 'dotenv/config';
import postgres from 'postgres';
import {drizzle} from 'drizzle-orm/postgres-js';
import {
  demoMatches,
  demoNews,
  demoTeamDetail,
  demoTeams,
  demoTournamentDetail,
  demoTournaments,
  demoTranslations
} from '../src/lib/demo-data';
import * as schema from '../src/lib/db/schema';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required. Copy .env.example to .env first.');
    process.exit(1);
  }
  const client = postgres(process.env.DATABASE_URL, {max: 1});
  const db = drizzle(client, {schema});

  console.log('Clearing existing data…');
  await db.delete(schema.translations);
  await db.delete(schema.newsTags);
  await db.delete(schema.news);
  await db.delete(schema.tags);
  await db.delete(schema.matchResults);
  await db.delete(schema.matches);
  await db.delete(schema.tournamentTeams);
  await db.delete(schema.transfers);
  await db.delete(schema.players);
  await db.delete(schema.tournaments);
  await db.delete(schema.teams);

  console.log('Inserting teams and rosters…');
  const teamIdBySlug = new Map<string, string>();
  const teamIdByDemoId = new Map<string, string>();
  const teamIdByName = new Map<string, string>();
  const playerIdByKey = new Map<string, string>();
  for (const team of demoTeams) {
    const detail = demoTeamDetail(team.slug)!;
    const [inserted] = await db
      .insert(schema.teams)
      .values({
        slug: team.slug,
        name: team.name,
        fullName: detail.fullName,
        region: team.region,
        orgName: team.orgName,
        liquipediaPage: team.name
      })
      .returning({id: schema.teams.id});
    teamIdBySlug.set(team.slug, inserted.id);
    teamIdByDemoId.set(team.id, inserted.id);
    teamIdByName.set(team.name, inserted.id);
    for (const player of detail.roster) {
      const [insertedPlayer] = await db
        .insert(schema.players)
        .values({
          teamId: inserted.id,
          nickname: player.nickname,
          realName: player.realName,
          role: player.role,
          countryCode: player.countryCode
        })
        .returning({id: schema.players.id});
      playerIdByKey.set(`${team.slug}:${player.nickname}`, insertedPlayer.id);
    }
  }

  console.log('Inserting transfers…');
  for (const team of demoTeams) {
    const detail = demoTeamDetail(team.slug)!;
    for (const transfer of detail.transfers) {
      const playerId = playerIdByKey.get(`${team.slug}:${transfer.playerNickname}`);
      if (!playerId) continue;
      await db.insert(schema.transfers).values({
        playerId,
        fromTeamId: transfer.fromTeamName
          ? (teamIdByName.get(transfer.fromTeamName) ?? null)
          : null,
        toTeamId: transfer.toTeamName
          ? (teamIdByName.get(transfer.toTeamName) ?? null)
          : null,
        transferDate: transfer.transferDate
      });
    }
  }

  console.log('Inserting tournaments…');
  const tournamentIdByDemoId = new Map<string, string>();
  for (const tournament of demoTournaments()) {
    const detail = demoTournamentDetail(tournament.slug)!;
    const [inserted] = await db
      .insert(schema.tournaments)
      .values({
        slug: tournament.slug,
        name: tournament.name,
        tier: tournament.tier,
        region: tournament.region,
        startDate: tournament.startDate,
        endDate: tournament.endDate,
        prizePool: tournament.prizePool?.toString() ?? null,
        prizeCurrency: tournament.prizeCurrency,
        format: detail.format,
        status: tournament.status,
        streamUrl: tournament.streamUrl,
        liquipediaPage: tournament.name
      })
      .returning({id: schema.tournaments.id});
    tournamentIdByDemoId.set(tournament.id, inserted.id);
    for (const team of detail.teams) {
      await db.insert(schema.tournamentTeams).values({
        tournamentId: inserted.id,
        teamId: teamIdByDemoId.get(team.id)!,
        seed: team.seed,
        finalRank: team.finalRank,
        totalPoints: team.totalPoints,
        totalKills: team.totalKills
      });
    }
  }

  console.log('Inserting matches and results…');
  for (const match of demoMatches()) {
    const [inserted] = await db
      .insert(schema.matches)
      .values({
        tournamentId: tournamentIdByDemoId.get(match.tournamentId)!,
        stage: match.stage,
        matchNumber: match.matchNumber,
        map: match.map,
        scheduledAt: new Date(match.scheduledAt),
        status: match.status,
        streamUrl: match.streamUrl
      })
      .returning({id: schema.matches.id});
    for (const result of match.results) {
      await db.insert(schema.matchResults).values({
        matchId: inserted.id,
        teamId: teamIdByDemoId.get(result.team.id)!,
        placement: result.placement,
        kills: result.kills,
        placementPoints: result.placementPoints,
        killPoints: result.killPoints,
        totalPoints: result.totalPoints
      });
    }
  }

  console.log('Inserting news, tags and translations…');
  const tagIdBySlug = new Map<string, string>();
  for (const [slug, label] of [
    ['transfers', 'Transfers'],
    ['results', 'Results'],
    ['tournaments', 'Tournaments'],
    ['patch-notes', 'Patch notes']
  ] as const) {
    const [inserted] = await db
      .insert(schema.tags)
      .values({slug, label})
      .returning({id: schema.tags.id});
    tagIdBySlug.set(slug, inserted.id);
  }

  const newsIdByDemoId = new Map<string, string>();
  for (const item of demoNews()) {
    const [inserted] = await db
      .insert(schema.news)
      .values({
        slug: item.slug,
        title: item.title,
        excerpt: item.excerpt,
        body: item.body,
        sourceName: item.sourceName,
        sourceUrl: item.sourceUrl,
        publishedAt: new Date(item.publishedAt)
      })
      .returning({id: schema.news.id});
    newsIdByDemoId.set(item.id, inserted.id);
    for (const tagSlug of item.tags) {
      await db.insert(schema.newsTags).values({
        newsId: inserted.id,
        tagId: tagIdBySlug.get(tagSlug)!
      });
    }
  }

  for (const translation of demoTranslations) {
    const entityId =
      translation.entityType === 'news'
        ? newsIdByDemoId.get(translation.entityId)
        : undefined;
    if (!entityId) continue;
    await db.insert(schema.translations).values({...translation, entityId});
  }

  console.log('Done. Seeded', demoTeams.length, 'teams and', demoTournaments().length, 'tournaments.');
  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
