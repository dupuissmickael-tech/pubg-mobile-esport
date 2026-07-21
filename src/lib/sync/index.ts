import {revalidatePath} from 'next/cache';
import {runWithLog, type SyncJobName, type SyncResult} from './log';
import {syncLive} from './live';
import {syncNews} from './news';
import {syncTeams} from './teams';
import {syncTournaments} from './tournaments';

const JOBS: Record<SyncJobName, () => Promise<{items: number; partial?: boolean}>> = {
  tournaments: syncTournaments,
  teams: syncTeams,
  live: syncLive,
  news: syncNews
};

export function isSyncJobName(value: string): value is SyncJobName {
  return value in JOBS;
}

export async function runSyncJob(
  job: SyncJobName,
  manual = false
): Promise<SyncResult> {
  const result = await runWithLog(manual ? `manual:${job}` : job, JOBS[job]);
  if (result.status !== 'error') {
    // Regenerate ISR pages so fresh data is visible without waiting for the
    // next revalidation window.
    revalidatePath('/', 'layout');
  }
  return result;
}
