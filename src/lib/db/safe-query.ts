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

/**
 * postgres.js errors set `.message` to a generic "Failed query: ... params:
 * ..." dump — the actual reason (constraint violation, invalid enum value,
 * etc.) lives on `.cause`. Same for most wrapped/aggregate errors. This
 * pulls out the real reason so it's actually visible in /admin and logs,
 * instead of a query dump or a bare HTTP status code.
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    const cause = (error as {cause?: unknown}).cause;
    if (cause) {
      const causeMessage =
        cause instanceof Error
          ? cause.message
          : typeof cause === 'object' && cause !== null
            ? ((cause as Record<string, unknown>).message ?? JSON.stringify(cause))
            : String(cause);
      return `${error.message} — ${causeMessage}`;
    }
    return error.message;
  }
  return String(error);
}
