import {asc, sql} from 'drizzle-orm';
import {getDb} from '@/lib/db';
import {tournaments} from '@/lib/db/schema';
import {getCategoryMembers, getPageWikitext} from '@/lib/liquipedia/client';
import {infoboxToTournament, parseInfobox} from '@/lib/liquipedia/parsers';

/**
 * Liquipedia's rate limit for `action=parse` is 1 request / 30 s, and cron
 * invocations are short-lived, so each run refreshes a small batch of pages.
 * Rotation is by `updated_at`: the least recently refreshed tournaments are
 * refreshed first, so the whole catalogue converges over successive runs.
 */
const PAGES_PER_RUN = 2;

export async function syncTournaments(): Promise<{
  items: number;
  partial?: boolean;
}> {
  const db = getDb();
  let items = 0;
  let partial = false;

  // 1. Discover tournament pages (cheap query API call).
  const members = await getCategoryMembers('Category:Tournaments', 50);
  const knownTitles = new Set(
    (
      await db
        .select({page: tournaments.liquipediaPage})
        .from(tournaments)
    ).map((r) => r.page)
  );
  const newTitles = members
    .map((m) => m.title)
    .filter((title) => !knownTitles.has(title));

  // 2. Pick pages to refresh: new ones first, then the stalest known ones.
  const stale = await db
    .select({page: tournaments.liquipediaPage})
    .from(tournaments)
    .where(sql`${tournaments.liquipediaPage} is not null`)
    .orderBy(asc(tournaments.updatedAt))
    .limit(PAGES_PER_RUN);
  const toRefresh = [
    ...newTitles,
    ...stale.map((r) => r.page as string)
  ].slice(0, PAGES_PER_RUN);

  // 3. Parse and upsert each page.
  for (const title of toRefresh) {
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
    await db
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
      });
    items++;
  }

  // 4. Recompute statuses from dates (cheap, applies to every tournament).
  await db.execute(sql`
    update tournaments set status = case
      when current_date < start_date then 'upcoming'::tournament_status
      when current_date > end_date then 'completed'::tournament_status
      else 'ongoing'::tournament_status
    end
  `);

  return {items, partial};
}
