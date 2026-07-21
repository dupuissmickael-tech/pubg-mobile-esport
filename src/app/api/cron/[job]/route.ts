import {NextRequest, NextResponse} from 'next/server';
import {isSyncJobName, runSyncJob} from '@/lib/sync';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Scheduled sync endpoints, invoked by Vercel Cron (see vercel.json):
 *   /api/cron/sync-tournaments, /api/cron/sync-teams,
 *   /api/cron/sync-live, /api/cron/sync-news
 * Protected by the CRON_SECRET bearer token that Vercel attaches
 * automatically to cron invocations.
 */
export async function GET(
  request: NextRequest,
  {params}: {params: Promise<{job: string}>}
) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  const {job} = await params;
  const name = job.replace(/^sync-/, '');
  if (!isSyncJobName(name)) {
    return NextResponse.json({error: `Unknown job: ${job}`}, {status: 404});
  }

  const result = await runSyncJob(name);
  return NextResponse.json(result, {
    status: result.status === 'error' ? 500 : 200
  });
}
