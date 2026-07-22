import {getDb, hasDatabase} from '@/lib/db';
import {formatError} from '@/lib/db/safe-query';
import {syncLogs} from '@/lib/db/schema';

export type SyncJobName = 'tournaments' | 'teams' | 'live' | 'news';

export interface SyncResult {
  job: string;
  status: 'success' | 'partial' | 'error';
  itemsUpserted: number;
  errorMessage: string | null;
  durationMs: number;
}

/**
 * Runs a sync job and records the outcome in sync_logs so the /admin page
 * can verify that scheduled jobs are healthy.
 */
export async function runWithLog(
  job: SyncJobName | `manual:${SyncJobName}`,
  fn: () => Promise<{items: number; partial?: boolean}>
): Promise<SyncResult> {
  const startedAt = new Date();

  if (!hasDatabase()) {
    return {
      job,
      status: 'error',
      itemsUpserted: 0,
      errorMessage:
        'DATABASE_URL is not configured — sync jobs need a real database (the site is running in demo mode).',
      durationMs: 0
    };
  }

  let status: SyncResult['status'] = 'success';
  let items = 0;
  let errorMessage: string | null = null;

  try {
    const outcome = await fn();
    items = outcome.items;
    if (outcome.partial) status = 'partial';
  } catch (error) {
    status = 'error';
    errorMessage = formatError(error);
  }

  const finishedAt = new Date();
  try {
    const db = getDb();
    await db.insert(syncLogs).values({
      job,
      status,
      itemsUpserted: items,
      errorMessage,
      startedAt,
      finishedAt
    });
  } catch {
    // Logging must never mask the job outcome.
  }

  return {
    job,
    status,
    itemsUpserted: items,
    errorMessage,
    durationMs: finishedAt.getTime() - startedAt.getTime()
  };
}
