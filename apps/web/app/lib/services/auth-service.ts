const BEARER_TOKEN_KEY = 'bearer_token';

/**
 * Get the current bearer token from localStorage.
 *
 * @returns The current bearer token or null if not found.
 *
 * @example
 * const token = getToken();
 * if (token) {
 *   console.log('User is authenticated');
 * }
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(BEARER_TOKEN_KEY);
}

/**
 * Store the bearer token in localStorage.
 *
 * @param token - The bearer token to store.
 *
 * @example
 * setToken('your-bearer-token');
 */
export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BEARER_TOKEN_KEY, token);
}

/**
 * Remove the bearer token from localStorage.
 *
 * @example
 * clearToken();
 */
export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(BEARER_TOKEN_KEY);
}

/**
 * Check if user has a token (client-side auth check).
 *
 * @returns True if the user has a token, false otherwise.
 *
 * @example
 * const hasToken = hasToken();
 * if (hasToken) {
 *   console.log('User is authenticated');
 * }
 */
export function hasToken(): boolean {
  return !!getToken();
}
