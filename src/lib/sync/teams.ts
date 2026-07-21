import {asc, sql} from 'drizzle-orm';
import {getDb} from '@/lib/db';
import {teams} from '@/lib/db/schema';
import {getCategoryMembers, getPageWikitext} from '@/lib/liquipedia/client';
import {infoboxToTeam, parseInfobox} from '@/lib/liquipedia/parsers';

const PAGES_PER_RUN = 2;

export async function syncTeams(): Promise<{items: number; partial?: boolean}> {
  const db = getDb();
  let items = 0;
  let partial = false;

  const members = await getCategoryMembers('Category:Teams', 50);
  const knownTitles = new Set(
    (await db.select({page: teams.liquipediaPage}).from(teams)).map(
      (r) => r.page
    )
  );
  const newTitles = members
    .map((m) => m.title)
    .filter((title) => !knownTitles.has(title));

  const stale = await db
    .select({page: teams.liquipediaPage})
    .from(teams)
    .where(sql`${teams.liquipediaPage} is not null`)
    .orderBy(asc(teams.updatedAt))
    .limit(PAGES_PER_RUN);
  const toRefresh = [...newTitles, ...stale.map((r) => r.page as string)].slice(
    0,
    PAGES_PER_RUN
  );

  for (const title of toRefresh) {
    const wikitext = await getPageWikitext(title);
    if (!wikitext) {
      partial = true;
      continue;
    }
    const infobox = parseInfobox(wikitext, 'Infobox team');
    const parsed = infobox ? infoboxToTeam(title, infobox) : null;
    if (!parsed) {
      partial = true;
      continue;
    }
    await db
      .insert(teams)
      .values(parsed)
      .onConflictDoUpdate({
        target: teams.liquipediaPage,
        set: {
          name: parsed.name,
          fullName: parsed.fullName,
          region: parsed.region,
          orgName: parsed.orgName,
          updatedAt: new Date()
        }
      });
    items++;
  }

  return {items, partial};
}
