import {NextRequest, NextResponse} from 'next/server';
import {runMigrations} from '@/lib/db/migrate';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Applies pending SQL migrations (./drizzle) to DATABASE_URL. Lets the
 * database schema be set up from the /admin page alone, without a
 * terminal — e.g. right after deploying to Vercel from a phone.
 */
export async function POST(request: NextRequest) {
  const token = process.env.ADMIN_TOKEN;
  const auth = request.headers.get('authorization');
  if (!token || auth !== `Bearer ${token}`) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({error: 'DATABASE_URL is not configured'}, {status: 400});
  }

  try {
    await runMigrations();
    return NextResponse.json({status: 'success'});
  } catch (error) {
    return NextResponse.json(
      {status: 'error', errorMessage: error instanceof Error ? error.message : String(error)},
      {status: 500}
    );
  }
}
