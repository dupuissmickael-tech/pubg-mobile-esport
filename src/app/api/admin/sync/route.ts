import {NextRequest, NextResponse} from 'next/server';
import {isSyncJobName, runSyncJob} from '@/lib/sync';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/** Manual sync trigger used by the /admin page. Requires ADMIN_TOKEN. */
export async function POST(request: NextRequest) {
  const token = process.env.ADMIN_TOKEN;
  const auth = request.headers.get('authorization');
  if (!token || auth !== `Bearer ${token}`) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  let job: unknown;
  try {
    ({job} = await request.json());
  } catch {
    return NextResponse.json({error: 'Invalid JSON body'}, {status: 400});
  }
  if (typeof job !== 'string' || !isSyncJobName(job)) {
    return NextResponse.json({error: `Unknown job: ${job}`}, {status: 400});
  }

  const result = await runSyncJob(job, true);
  return NextResponse.json(result, {
    status: result.status === 'error' ? 500 : 200
  });
}
