import postgres from 'postgres';
import {drizzle, type PostgresJsDatabase} from 'drizzle-orm/postgres-js';
import * as schema from './schema';

let cached: PostgresJsDatabase<typeof schema> | null = null;

/**
 * True when a real database is configured. Without DATABASE_URL the site
 * runs in demo mode: queries fall back to the bundled sample dataset so the
 * project can be developed and built without any infrastructure.
 */
export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Uses the standard PostgreSQL wire protocol (via postgres.js) rather than
 * a provider-specific HTTP driver, so the same code works unmodified against
 * Neon, Supabase, or any PostgreSQL instance.
 */
export function getDb(): PostgresJsDatabase<typeof schema> {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not set. Configure it or rely on demo mode.'
    );
  }
  if (!cached) {
    const client = postgres(process.env.DATABASE_URL, {max: 1});
    cached = drizzle(client, {schema});
  }
  return cached;
}

export {schema};
