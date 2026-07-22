import {eq} from 'drizzle-orm';
import {getDb, hasDatabase} from '@/lib/db';
import {rateLimits} from '@/lib/db/schema';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// In-memory fallback for local/demo runs without a database — still
// serverless-safe in production since the DB-backed path below is used
// whenever DATABASE_URL is configured.
const memory = new Map<string, number>();

/**
 * Waits until `intervalMs` has passed since the last call with the same
 * `key`, persisting the timestamp in Postgres so the wait is respected
 * across separate serverless invocations — a single admin button tap and
 * the next one a few seconds later both go through the same real-world
 * clock, not two independent in-memory timers.
 */
export async function waitForRateLimit(key: string, intervalMs: number): Promise<void> {
  if (!hasDatabase()) {
    const now = Date.now();
    const wait = (memory.get(key) ?? 0) + intervalMs - now;
    if (wait > 0) await sleep(wait);
    memory.set(key, Date.now());
    return;
  }

  const db = getDb();
  const [row] = await db
    .select({lastAt: rateLimits.lastAt})
    .from(rateLimits)
    .where(eq(rateLimits.key, key))
    .limit(1);

  const now = Date.now();
  const wait = row ? row.lastAt.getTime() + intervalMs - now : 0;
  if (wait > 0) await sleep(wait);

  const timestamp = new Date();
  await db
    .insert(rateLimits)
    .values({key, lastAt: timestamp})
    .onConflictDoUpdate({target: rateLimits.key, set: {lastAt: timestamp}});
}
