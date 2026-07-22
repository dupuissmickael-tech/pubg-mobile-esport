import {sql} from 'drizzle-orm';
import {getDb} from '@/lib/db';
import {teams, tournamentTeams, tournaments} from '@/lib/db/schema';
import {getPageWikitext, searchPageTitle} from '@/lib/liquipedia/client';
import {
  infoboxToTournament,
  parseInfobox,
  parseParticipantTeams,
  slugify
} from '@/lib/liquipedia/parsers';

/**
 * Scoped to the specific tournaments this site tracks — not a generic
 * "every tournament ever" crawl. Add/remove entries here to change which
 * tournaments (and, via their participants list, which teams) get synced.
 * The free-text query is resolved to an exact Liquipedia page title via
 * search, since the precise title format isn't guaranteed.
 */
const TARGET_TOURNAMENTS = ['PMGC 2025', 'PMWC 2026'];

export async function syncTournaments(): Promise<{
  items: number;
  partial?: boolean;
}> {
  const db = getDb();
  let items = 0;
  let partial = false;

  for (const query of TARGET_TOURNAMENTS) {
    const title = await searchPageTitle(query);
    if (!title) {
      partial = true;
      continue;
    }

    const wikitext = await getPageWikitext(title);
    if (!wikitext) {
      partial = true;
      continue;
    }

    const infobox = parseInfobox(wikitext, 'Infobox league');
    const parsed = infobox ? infoboxToTournament(title, infobox) : null;
    if (!parsed) {
      partial = true;
      continue;
    }

    const [tournament] = await db
      .insert(tournaments)
      .values({
        slug: parsed.slug,
        name: parsed.name,
        tier: parsed.tier,
        region: parsed.region,
        startDate: parsed.startDate,
        endDate: parsed.endDate,
        prizePool: parsed.prizePool?.toString() ?? null,
        format: parsed.format,
        streamUrl: parsed.streamUrl,
        liquipediaPage: parsed.liquipediaPage
      })
      .onConflictDoUpdate({
        target: tournaments.liquipediaPage,
        set: {
          name: parsed.name,
          tier: parsed.tier,
          region: parsed.region,
          startDate: parsed.startDate,
          endDate: parsed.endDate,
          prizePool: parsed.prizePool?.toString() ?? null,
          format: parsed.format,
          streamUrl: parsed.streamUrl,
          updatedAt: new Date()
        }
      })
      .returning({id: tournaments.id});
    items++;

    // Register participants as lightweight team stubs (name + liquipedia
    // page only) so they show up immediately; the teams sync job fills in
    // logo/roster/region for each over its own rate-limited runs. Fetching
    // every participant's full page in this same run would blow well past
    // Liquipedia's rate limit and the serverless function time budget.
    const participantNames = parseParticipantTeams(wikitext);
    for (const teamName of participantNames) {
      const [team] = await db
        .insert(teams)
        .values({
          slug: slugify(teamName),
          name: teamName,
          liquipediaPage: teamName
        })
        .onConflictDoNothing({target: teams.liquipediaPage})
        .returning({id: teams.id});

      const teamId =
        team?.id ??
        (
          await db
            .select({id: teams.id})
            .from(teams)
            .where(sql`${teams.liquipediaPage} = ${teamName}`)
            .limit(1)
        )[0]?.id;
      if (!teamId) continue;

      // onConflictDoNothing: never reset a link's accumulated live
      // standings (total_points/total_kills) just because the tournament
      // page was re-synced.
      await db
        .insert(tournamentTeams)
        .values({tournamentId: tournament.id, teamId})
        .onConflictDoNothing();
    }
  }

  // Recompute statuses from dates (cheap, applies to every tournament).
  await db.execute(sql`
    update tournaments set status = case
      when current_date < start_date then 'upcoming'::tournament_status
      when current_date > end_date then 'completed'::tournament_status
      else 'ongoing'::tournament_status
    end
  `);

  return {items, partial};
}
