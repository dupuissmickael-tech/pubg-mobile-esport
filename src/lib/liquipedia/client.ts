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

const API_BASE = 'https://liquipedia.net/pubgmobile/api.php';

const PARSE_INTERVAL_MS = 30_000;
const DEFAULT_INTERVAL_MS = 2_000;

let lastParseAt = 0;
let lastQueryAt = 0;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function throttle(action: string): Promise<void> {
  const now = Date.now();
  if (action === 'parse') {
    const wait = lastParseAt + PARSE_INTERVAL_MS - now;
    if (wait > 0) await sleep(wait);
    lastParseAt = Date.now();
  } else {
    const wait = lastQueryAt + DEFAULT_INTERVAL_MS - now;
    if (wait > 0) await sleep(wait);
    lastQueryAt = Date.now();
  }
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
