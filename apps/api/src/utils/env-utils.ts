/**
 * Check if the application is running in a development environment.
 * This is determined by checking if the frontend URL contains 'localhost'.
 *
 * @param frontendUrl - The FRONTEND_URL environment variable
 * @returns true if running in development (localhost), false otherwise
 */
export function isDevelopment(frontendUrl: string): boolean {
  return frontendUrl.includes('localhost');
}
