import {asc, eq, sql} from 'drizzle-orm';
import {getDb} from '@/lib/db';
import {players, teams} from '@/lib/db/schema';
import {fetchFileAsDataUri, getPageWikitext} from '@/lib/liquipedia/client';
import {
  infoboxToTeam,
  parseInfobox,
  parsePlayerRoster
} from '@/lib/liquipedia/parsers';

const PAGES_PER_RUN = 2;

/**
 * Fetches one team's Liquipedia page and upserts its info, logo and roster.
 * Shared by the teams refresh job and by the tournament sync (which
 * discovers team pages from a tournament's participants list).
 */
export async function syncSingleTeam(
  title: string
): Promise<{success: boolean; teamId?: string}> {
  const db = getDb();
  const wikitext = await getPageWikitext(title);
  if (!wikitext) return {success: false};

  const infobox = parseInfobox(wikitext, 'Infobox team');
  const parsed = infobox ? infoboxToTeam(title, infobox) : null;
  if (!parsed) return {success: false};

  const logoFile = infobox?.image || infobox?.logo;
  const logoUrl = logoFile ? await fetchFileAsDataUri(logoFile) : null;

  const [team] = await db
    .insert(teams)
    .values({...parsed, logoUrl})
    .onConflictDoUpdate({
      target: teams.liquipediaPage,
      // Only overwrite logoUrl when this run actually got one — a
      // transient fetch failure on a later refresh shouldn't erase a logo
      // saved by a previous successful run.
      set: {
        name: parsed.name,
        fullName: parsed.fullName,
        region: parsed.region,
        orgName: parsed.orgName,
        updatedAt: new Date(),
        ...(logoUrl ? {logoUrl} : {})
      }
    })
    .returning({id: teams.id});

  await syncRoster(team.id, wikitext);
  return {success: true, teamId: team.id};
}

/**
 * Refreshes teams already known in our database (discovered via tournament
 * participants lists — see sync/tournaments.ts) — prioritizing any missing
 * a logo, then the least recently refreshed.
 */
export async function syncTeams(): Promise<{items: number; partial?: boolean}> {
  const db = getDb();
  let items = 0;
  let partial = false;

  const missingLogo = await db
    .select({page: teams.liquipediaPage})
    .from(teams)
    .where(sql`${teams.liquipediaPage} is not null and ${teams.logoUrl} is null`)
    .orderBy(asc(teams.updatedAt))
    .limit(PAGES_PER_RUN);

  const stale = await db
    .select({page: teams.liquipediaPage})
    .from(teams)
    .where(sql`${teams.liquipediaPage} is not null`)
    .orderBy(asc(teams.updatedAt))
    .limit(PAGES_PER_RUN);

  const toRefresh = [
    ...new Set([
      ...missingLogo.map((r) => r.page as string),
      ...stale.map((r) => r.page as string)
    ])
  ].slice(0, PAGES_PER_RUN);

  for (const title of toRefresh) {
    const result = await syncSingleTeam(title);
    if (result.success) items++;
    else partial = true;
  }

  return {items, partial};
}

/**
 * Upserts a team's active roster (parsed from the same page fetch, no extra
 * request needed). Players no longer listed are unassigned from the team
 * rather than deleted, in case they're reassigned by a later transfer.
 */
async function syncRoster(teamId: string, wikitext: string): Promise<void> {
  const roster = parsePlayerRoster(wikitext);
  if (roster.length === 0) return;

  const db = getDb();
  const existing = await db
    .select({id: players.id, nickname: players.nickname})
    .from(players)
    .where(eq(players.teamId, teamId));
  const existingByNickname = new Map(existing.map((p) => [p.nickname, p.id]));
  const rosterNicknames = new Set(roster.map((p) => p.nickname));

  for (const player of roster) {
    const existingId = existingByNickname.get(player.nickname);
    if (existingId) {
      await db
        .update(players)
        .set({
          realName: player.realName,
          role: player.role,
          countryCode: player.countryCode,
          isActive: true,
          updatedAt: new Date()
        })
        .where(eq(players.id, existingId));
    } else {
      await db.insert(players).values({
        teamId,
        nickname: player.nickname,
        realName: player.realName,
        role: player.role,
        countryCode: player.countryCode
      });
    }
  }

  for (const player of existing) {
    if (!rosterNicknames.has(player.nickname)) {
      await db
        .update(players)
        .set({isActive: false, teamId: null, updatedAt: new Date()})
        .where(eq(players.id, player.id));
    }
  }
}
