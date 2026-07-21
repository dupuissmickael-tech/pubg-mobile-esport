import {neon} from '@neondatabase/serverless';
import {drizzle, type NeonHttpDatabase} from 'drizzle-orm/neon-http';
import * as schema from './schema';

let cached: NeonHttpDatabase<typeof schema> | null = null;

/**
 * True when a real database is configured. Without DATABASE_URL the site
 * runs in demo mode: queries fall back to the bundled sample dataset so the
 * project can be developed and built without any infrastructure.
 */
export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb(): NeonHttpDatabase<typeof schema> {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not set. Configure it or rely on demo mode.'
    );
  }
  if (!cached) {
    const sql = neon(process.env.DATABASE_URL);
    cached = drizzle(sql, {schema});
  }
  return cached;
}

export {schema};
