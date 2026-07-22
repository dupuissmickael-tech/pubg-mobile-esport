import {NextRequest, NextResponse} from 'next/server';
import {clearAllData} from '@/lib/db/seed';
import {formatError} from '@/lib/db/safe-query';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Wipes every row from every table, without reloading demo data. Used to
 * return to a clean slate before pulling real data from Liquipedia.
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
    await clearAllData();
    return NextResponse.json({status: 'success'});
  } catch (error) {
    return NextResponse.json(
      {status: 'error', errorMessage: formatError(error)},
      {status: 500}
    );
  }
}
