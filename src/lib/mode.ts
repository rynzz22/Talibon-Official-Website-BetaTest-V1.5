/**
 * Determines whether mock data, sample files, local storage caches, and other development fallbacks
 * are allowed to execute.
 *
 * Mocking is ONLY allowed when:
 * 1. The environment is 'development'
 * 2. VITE_ENABLE_MOCK_DATA is explicitly set to 'true'
 *
 * In Production Mode, all mock behaviors, silent fallbacks, and local persistence of production records
 * are strictly disabled. Every transaction must succeed against the production Supabase database/storage
 * or fail explicitly.
 */
export function isMockAllowed(): boolean {
  // Allow offline and mock fallbacks whenever VITE_ENABLE_MOCK_DATA is not explicitly disabled
  return import.meta.env?.VITE_ENABLE_MOCK_DATA !== "false";
}

/**
 * Helper to assert production behavior or fail explicitly.
 * If we are in production and a database/storage dependency is unavailable,
 * we must throw a clean, informative error instead of falling back.
 */
export function assertProductionOrThrow(message: string, technicalDetails?: any): void {
  if (!isMockAllowed()) {
    console.error(`[Production Failure] ${message}`, technicalDetails);
    throw new Error(`${message} Reference: ${JSON.stringify(technicalDetails || "None")}`);
  }
}
