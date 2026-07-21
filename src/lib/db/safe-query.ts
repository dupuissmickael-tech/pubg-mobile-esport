/**
 * Runs a real-database query and falls back to a safe default if it throws
 * — e.g. the schema hasn't been migrated yet (first deploy, before /admin's
 * "Apply schema" has run), or the database is temporarily unreachable.
 * Keeps pages rendering (with an empty/no-data state) instead of crashing
 * the build or a request, mirroring the Liquipedia fallback behavior.
 */
export async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error('Database query failed, falling back:', error);
    return fallback;
  }
}
