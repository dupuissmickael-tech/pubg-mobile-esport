import {NextRequest, NextResponse} from 'next/server';
import {seedDemoData} from '@/lib/db/seed';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Wipes and reloads the bundled sample dataset. Intended for a fresh
 * demo/development database — not for a production database that already
 * holds real synced data.
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
    const {items} = await seedDemoData();
    return NextResponse.json({status: 'success', items});
  } catch (error) {
    return NextResponse.json(
      {status: 'error', errorMessage: error instanceof Error ? error.message : String(error)},
      {status: 500}
    );
  }
}
