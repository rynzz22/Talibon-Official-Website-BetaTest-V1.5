/**
 * Determines whether mock data, sample files, and other development fallbacks
 * are allowed on the server.
 *
 * Mocking is ONLY allowed when:
 * 1. NODE_ENV is 'development'
 * 2. VITE_ENABLE_MOCK_DATA or ENABLE_MOCK_DATA is explicitly set to 'true'
 */
export function isMockAllowedServer(): boolean {
  const isDev = process.env.NODE_ENV === "development";
  const isMockEnabled = process.env.VITE_ENABLE_MOCK_DATA === "true" || process.env.ENABLE_MOCK_DATA === "true";
  
  // Mock mode should ONLY activate when explicitly enabled by a development flag
  return isDev && isMockEnabled;
}

/**
 * Asserts production behavior.
 * If mock data is not allowed and the requested resource/service is unavailable,
 * we throw an explicit server-side error.
 */
export function assertProductionOrThrowServer(message: string, technicalDetails?: any): void {
  if (!isMockAllowedServer()) {
    console.error(`[Production Server Failure] ${message}`, technicalDetails);
    throw new Error(`${message} Details: ${JSON.stringify(technicalDetails || "None")}`);
  }
}
