import {z} from 'zod';
import type {PlayerRole, Region, Tier} from '@/lib/types';

/**
 * Best-effort parsing of Liquipedia infobox templates from raw wikitext.
 * Liquipedia pages are community-edited, so every field is optional and
 * validated with zod before anything reaches the database.
 */

/** Finds the end of a `{{ }}` template starting at `start`, respecting nesting. */
function findTemplateEnd(wikitext: string, start: number): number | null {
  let depth = 0;
  for (let i = start; i < wikitext.length - 1; i++) {
    if (wikitext[i] === '{' && wikitext[i + 1] === '{') {
      depth++;
      i++;
    } else if (wikitext[i] === '}' && wikitext[i + 1] === '}') {
      depth--;
      i++;
      if (depth === 0) return i + 1;
    }
  }
  return null;
}

/** Splits a template body into `|key=value` params, respecting nested [[ ]] / {{ }}. */
function parseTemplateBody(body: string): Record<string, string> {
  const params: Record<string, string> = {};
  let level = 0;
  let current = '';
  const parts: string[] = [];
  for (let i = 0; i < body.length; i++) {
    const two = body.slice(i, i + 2);
    if (two === '{{' || two === '[[') {
      level++;
      current += two;
      i++;
    } else if (two === '}}' || two === ']]') {
      level--;
      current += two;
      i++;
    } else if (body[i] === '|' && level === 0) {
      parts.push(current);
      current = '';
    } else {
      current += body[i];
    }
  }
  parts.push(current);

  for (const part of parts.slice(1)) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim().toLowerCase();
    const value = part.slice(eq + 1).trim();
    if (key) params[key] = stripWikiMarkup(value);
  }
  return params;
}

/** Extracts `|key=value` parameters from the first `{{<templatePrefix> …}}` template. */
export function parseInfobox(
  wikitext: string,
  templatePrefix: string
): Record<string, string> | null {
  const start = wikitext.indexOf(`{{${templatePrefix}`);
  if (start === -1) return null;
  const end = findTemplateEnd(wikitext, start);
  if (end === null) return null;
  return parseTemplateBody(wikitext.slice(start + 2, end - 2));
}

/**
 * Extracts params for every `{{<templatePrefix> …}}` occurrence in the page
 * (case-insensitive) — used for repeated templates like roster rows, where
 * a page lists one per player rather than a single infobox.
 */
export function parseAllTemplates(
  wikitext: string,
  templatePrefix: string
): Record<string, string>[] {
  const results: Record<string, string>[] = [];
  const needle = `{{${templatePrefix}`.toLowerCase();
  const haystack = wikitext.toLowerCase();
  let searchFrom = 0;
  while (true) {
    const idx = haystack.indexOf(needle, searchFrom);
    if (idx === -1) break;
    const end = findTemplateEnd(wikitext, idx);
    if (end === null) break;
    results.push(parseTemplateBody(wikitext.slice(idx + 2, end - 2)));
    searchFrom = end;
  }
  return results;
}

export function stripWikiMarkup(value: string): string {
  return value
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1') // [[Page|Label]] -> Label
    .replace(/\{\{[^}]*\}\}/g, '') // drop nested templates
    .replace(/'{2,}/g, '') // bold/italic quotes
    .replace(/<[^>]+>/g, '') // html tags
    .trim();
}

const REGION_MAP: Record<string, Region> = {
  world: 'global',
  global: 'global',
  international: 'global',
  asia: 'asia',
  'east asia': 'asia',
  china: 'asia',
  'southeast asia': 'sea',
  sea: 'sea',
  'south asia': 'south_asia',
  'middle east': 'mena',
  mena: 'mena',
  africa: 'mena',
  europe: 'europe',
  cis: 'europe',
  'north america': 'na',
  americas: 'na',
  'south america': 'sa',
  'latin america': 'sa',
  brazil: 'sa'
};

export function mapRegion(raw: string | undefined): Region {
  if (!raw) return 'global';
  return REGION_MAP[raw.toLowerCase()] ?? 'global';
}

export function mapTier(raw: string | undefined): Tier {
  if (!raw) return 'b';
  const value = raw.toLowerCase();
  if (value.includes('qualifier')) return 'qualifier';
  if (value.includes('s-tier') || value === '1' || value === 's') return 's';
  if (value.includes('a-tier') || value === '2' || value === 'a') return 'a';
  return 'b';
}

const ROLE_MAP: Record<string, PlayerRole> = {
  igl: 'igl',
  'in-game leader': 'igl',
  leader: 'igl',
  assault: 'assaulter',
  assaulter: 'assaulter',
  fragger: 'assaulter',
  support: 'support',
  sniper: 'sniper',
  dmr: 'sniper',
  'sniper/dmr': 'sniper',
  scout: 'scout',
  flex: 'scout',
  coach: 'coach',
  'head coach': 'coach',
  analyst: 'coach',
  manager: 'coach',
  sub: 'sub',
  substitute: 'sub',
  benched: 'sub',
  inactive: 'sub'
};

export function mapRole(raw: string | undefined): PlayerRole | null {
  if (!raw) return null;
  return ROLE_MAP[raw.toLowerCase().trim()] ?? null;
}

// Common nations in the PUBG Mobile competitive scene, by the country name
// Liquipedia's `flag=` parameter typically spells out (rather than a code).
const COUNTRY_NAME_MAP: Record<string, string> = {
  china: 'CN',
  'hong kong': 'HK',
  taiwan: 'TW',
  mongolia: 'MN',
  japan: 'JP',
  'south korea': 'KR',
  thailand: 'TH',
  vietnam: 'VN',
  indonesia: 'ID',
  malaysia: 'MY',
  singapore: 'SG',
  philippines: 'PH',
  cambodia: 'KH',
  myanmar: 'MM',
  india: 'IN',
  pakistan: 'PK',
  bangladesh: 'BD',
  nepal: 'NP',
  'sri lanka': 'LK',
  'saudi arabia': 'SA',
  'united arab emirates': 'AE',
  egypt: 'EG',
  jordan: 'JO',
  kuwait: 'KW',
  qatar: 'QA',
  iraq: 'IQ',
  turkey: 'TR',
  russia: 'RU',
  ukraine: 'UA',
  poland: 'PL',
  germany: 'DE',
  france: 'FR',
  'united kingdom': 'GB',
  spain: 'ES',
  brazil: 'BR',
  argentina: 'AR',
  mexico: 'MX',
  chile: 'CL',
  peru: 'PE',
  colombia: 'CO',
  'united states': 'US',
  canada: 'CA'
};

/** Converts a Liquipedia `flag`/`country` value to an ISO 3166-1 alpha-2 code. */
export function mapCountryCode(raw: string | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw.trim();
  if (/^[a-zA-Z]{2}$/.test(cleaned)) return cleaned.toUpperCase();
  return COUNTRY_NAME_MAP[cleaned.toLowerCase()] ?? null;
}

export function parsePrizePool(raw: string | undefined): number | null {
  if (!raw) return null;
  const digits = raw.replace(/[^0-9.]/g, '');
  if (!digits) return null;
  const value = Number(digits);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function parseWikiDate(raw: string | undefined): string | null {
  if (!raw) return null;
  const match = raw.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match) return match[0];
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime())
    ? null
    : parsed.toISOString().slice(0, 10);
}

export const tournamentUpsertSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  tier: z.enum(['s', 'a', 'b', 'qualifier']),
  region: z.enum([
    'global',
    'asia',
    'sea',
    'south_asia',
    'mena',
    'europe',
    'na',
    'sa'
  ]),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  prizePool: z.number().nullable(),
  format: z.string().nullable(),
  streamUrl: z.string().url().nullable(),
  liquipediaPage: z.string().min(1)
});

export type TournamentUpsert = z.infer<typeof tournamentUpsertSchema>;

export const teamUpsertSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  fullName: z.string().nullable(),
  region: tournamentUpsertSchema.shape.region,
  orgName: z.string().nullable(),
  logoUrl: z.string().url().nullable(),
  liquipediaPage: z.string().min(1)
});

export type TeamUpsert = z.infer<typeof teamUpsertSchema>;

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Maps a parsed "Infobox league" to our tournament shape. */
export function infoboxToTournament(
  pageTitle: string,
  infobox: Record<string, string>
): TournamentUpsert | null {
  const name = infobox.name || stripWikiMarkup(pageTitle);
  const startDate = parseWikiDate(infobox.sdate ?? infobox.date);
  const endDate = parseWikiDate(infobox.edate ?? infobox.date) ?? startDate;
  if (!name || !startDate || !endDate) return null;

  const candidate = {
    slug: slugify(pageTitle),
    name,
    tier: mapTier(infobox.liquipediatier ?? infobox.tier),
    region: mapRegion(infobox.region ?? infobox.country),
    startDate,
    endDate,
    prizePool: parsePrizePool(infobox.prizepoolusd ?? infobox.prizepool),
    format: infobox.format || null,
    streamUrl: infobox.youtube
      ? `https://www.youtube.com/${infobox.youtube}`
      : infobox.twitch
        ? `https://www.twitch.tv/${infobox.twitch}`
        : null,
    liquipediaPage: pageTitle
  };
  const result = tournamentUpsertSchema.safeParse(candidate);
  return result.success ? result.data : null;
}

/** Maps a parsed "Infobox team" to our team shape. */
export function infoboxToTeam(
  pageTitle: string,
  infobox: Record<string, string>
): TeamUpsert | null {
  const name = infobox.name || stripWikiMarkup(pageTitle);
  if (!name) return null;
  const candidate = {
    slug: slugify(pageTitle),
    name,
    fullName: infobox.romanized_name || null,
    region: mapRegion(infobox.region ?? infobox.location),
    orgName: infobox.parent || null,
    // Resolved separately by the sync job (fetchFileAsDataUri): Liquipedia
    // blocks hotlinking, so the logo must be downloaded server-side rather
    // than referenced by a direct <img src> URL.
    logoUrl: null as string | null,
    liquipediaPage: pageTitle
  };
  const result = teamUpsertSchema.safeParse(candidate);
  return result.success ? result.data : null;
}

export interface ParsedRosterPlayer {
  nickname: string;
  realName: string | null;
  role: PlayerRole | null;
  countryCode: string | null;
}

// Liquipedia game wikis don't all use the same roster template name; try
// each candidate and use the first one that actually matches the page.
const ROSTER_TEMPLATE_CANDIDATES = ['RosterTableRow', 'TeamPlayer', 'Player'];

/**
 * Parses a team page's active roster. The exact template name varies by
 * wiki, so this tries a short list of known conventions and keeps whichever
 * one yields results — best-effort, since Liquipedia roster markup isn't
 * standardized across every game wiki.
 */
export function parsePlayerRoster(wikitext: string): ParsedRosterPlayer[] {
  for (const templateName of ROSTER_TEMPLATE_CANDIDATES) {
    const rows = parseAllTemplates(wikitext, templateName);
    const players = rows
      .map((row): ParsedRosterPlayer | null => {
        const nickname = row.id || row.name || row.player;
        if (!nickname) return null;
        return {
          nickname,
          realName: row.name2 || row.realname || row.namealt || null,
          role: mapRole(row.role || row.position),
          countryCode: mapCountryCode(row.flag || row.country || row.nationality)
        };
      })
      .filter((p): p is ParsedRosterPlayer => p !== null);
    if (players.length > 0) return players;
  }
  return [];
}
