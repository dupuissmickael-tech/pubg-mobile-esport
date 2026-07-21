import path from 'node:path';
import {migrate} from 'drizzle-orm/postgres-js/migrator';
import {getDb} from '.';

/**
 * Applies pending SQL migrations from ./drizzle (generated via
 * `npm run db:generate`) to the configured DATABASE_URL. Safe to call
 * repeatedly — already-applied migrations are skipped.
 */
export async function runMigrations(): Promise<{applied: string}> {
  const db = getDb();
  await migrate(db, {
    migrationsFolder: path.join(process.cwd(), 'drizzle')
  });
  return {applied: 'ok'};
}
