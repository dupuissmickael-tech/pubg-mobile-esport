/**
 * Liquipedia MediaWiki API client.
 *
 * Complies with the Liquipedia API terms of use:
 * - identifiable User-Agent (LIQUIPEDIA_USER_AGENT env var) on every request;
 * - rate limiting: max 1 request per 30s for `action=parse`, 1 per 2s for
 *   other actions;
 * - no HTML scraping — only the official api.php endpoint is used.
 *
 * All fetched data is cached in PostgreSQL by the sync jobs; pages never
 * call this client at render time, so an API outage only delays refreshes
 * and the site keeps serving the last known data.
 */

import {waitForRateLimit} from './rate-limit';

const API_BASE = 'https://liquipedia.net/pubgmobile/api.php';
const FILE_BASE = 'https://liquipedia.net/commons/Special:FilePath/';

const PARSE_INTERVAL_MS = 30_000;
const DEFAULT_INTERVAL_MS = 2_000;
const IMAGE_INTERVAL_MS = 2_000;
const MAX_IMAGE_BYTES = 300_000;

// Persisted in Postgres (see rate-limit.ts) — a serverless function is a
// fresh process on every invocation, so an in-memory-only timer would reset
// between two admin button taps a few seconds apart and could still exceed
// Liquipedia's real rate limit even though each individual invocation
// "throttled" correctly by its own (empty) clock.
async function throttle(action: string): Promise<void> {
  await waitForRateLimit(
    action === 'parse' ? 'liquipedia:parse' : 'liquipedia:query',
    action === 'parse' ? PARSE_INTERVAL_MS : DEFAULT_INTERVAL_MS
  );
}

function userAgent(): string {
  const ua = process.env.LIQUIPEDIA_USER_AGENT;
  if (!ua) {
    throw new Error(
      'LIQUIPEDIA_USER_AGENT is required to call the Liquipedia API ' +
        '(their terms of use require an identifiable User-Agent).'
    );
  }
  return ua;
}

export class LiquipediaError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = 'LiquipediaError';
  }
}

async function apiCall(
  params: Record<string, string>
): Promise<Record<string, unknown>> {
  const action = params.action ?? 'query';
  await throttle(action);

  const search = new URLSearchParams({...params, format: 'json'});
  const response = await fetch(`${API_BASE}?${search}`, {
    headers: {
      'User-Agent': userAgent(),
      'Accept-Encoding': 'gzip'
    },
    // Sync jobs run server-side on a schedule; never cache at fetch level.
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new LiquipediaError(
      `Liquipedia API responded with ${response.status}`,
      response.status
    );
  }
  const json = (await response.json()) as Record<string, unknown>;
  if (json.error) {
    throw new LiquipediaError(
      `Liquipedia API error: ${JSON.stringify(json.error)}`
    );
  }
  return json;
}

export interface CategoryMember {
  pageid: number;
  title: string;
}

/** Lists pages belonging to a category, e.g. "Category:Tournaments". */
export async function getCategoryMembers(
  category: string,
  limit = 50
): Promise<CategoryMember[]> {
  const json = await apiCall({
    action: 'query',
    list: 'categorymembers',
    cmtitle: category,
    cmlimit: String(limit),
    cmtype: 'page'
  });
  const query = json.query as
    | {categorymembers?: CategoryMember[]}
    | undefined;
  return query?.categorymembers ?? [];
}

/**
 * Finds the page whose title best matches a free-text query, e.g. "PMGC
 * 2025" — used to resolve a tournament's exact Liquipedia page title
 * without having to guess or hardcode it.
 */
export async function searchPageTitle(query: string): Promise<string | null> {
  const json = await apiCall({
    action: 'query',
    list: 'search',
    srsearch: query,
    srlimit: '1'
  });
  const search = json.query as {search?: Array<{title: string}>} | undefined;
  return search?.search?.[0]?.title ?? null;
}

/** Fetches the raw wikitext of a page (rate limited to 1 req / 30 s). */
export async function getPageWikitext(title: string): Promise<string | null> {
  const json = await apiCall({
    action: 'parse',
    page: title,
    prop: 'wikitext',
    redirects: '1'
  });
  const parse = json.parse as
    | {wikitext?: {['*']?: string}}
    | undefined;
  return parse?.wikitext?.['*'] ?? null;
}

/**
 * Downloads a Liquipedia-hosted file (e.g. a team logo referenced in an
 * infobox) and returns it as a data: URI. Liquipedia blocks hotlinking
 * (embedding their images directly via <img src>  from another domain) —
 * that protection targets browser requests, so a server-side download like
 * this one, with our identifiable User-Agent, is the compliant way to
 * display these logos on our own pages instead of a broken "hotlinking not
 * allowed" placeholder.
 */
export async function fetchFileAsDataUri(filename: string): Promise<string | null> {
  const clean = filename.replace(/^(File|Image):/i, '').trim();
  if (!clean) return null;

  await waitForRateLimit('liquipedia:image', IMAGE_INTERVAL_MS);

  const response = await fetch(`${FILE_BASE}${encodeURIComponent(clean)}`, {
    headers: {'User-Agent': userAgent()},
    cache: 'no-store'
  });
  if (!response.ok) return null;

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.startsWith('image/')) return null;

  const buffer = await response.arrayBuffer();
  if (buffer.byteLength === 0 || buffer.byteLength > MAX_IMAGE_BYTES) return null;

  return `data:${contentType};base64,${Buffer.from(buffer).toString('base64')}`;
}
