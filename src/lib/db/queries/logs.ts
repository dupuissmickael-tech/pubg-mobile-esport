import {desc} from 'drizzle-orm';
import {getDb, hasDatabase} from '..';
import {safeQuery} from '../safe-query';
import {syncLogs} from '../schema';
import type {SyncLogView} from '@/lib/types';

export async function listSyncLogs(limit = 30): Promise<SyncLogView[]> {
  if (!hasDatabase()) {
    return [];
  }
  return safeQuery(async () => {
    const db = getDb();
    const rows = await db
      .select()
      .from(syncLogs)
      .orderBy(desc(syncLogs.startedAt))
      .limit(limit);
    return rows.map((r) => ({
      id: r.id,
      job: r.job,
      status: r.status,
      itemsUpserted: r.itemsUpserted,
      errorMessage: r.errorMessage,
      startedAt: r.startedAt.toISOString(),
      finishedAt: r.finishedAt ? r.finishedAt.toISOString() : null
    }));
  }, []);
}
