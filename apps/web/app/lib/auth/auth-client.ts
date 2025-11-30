import { createAuthClient } from 'better-auth/react';

import { API_URL } from '@/lib/constants';

const BEARER_TOKEN_KEY = 'bearer_token';

/**
 * Better Auth client configured for Bearer token authentication.
 * Tokens are stored in localStorage and sent via Authorization header.
 *
 * @see https://www.better-auth.com/docs/installation#create-client-instance
 *
 * @param baseURL - The base URL of the API.
 * @param fetchOptions - The fetch options for the client.
 * @returns A Better Auth client instance.
 *
 * @example
 * const authClient = createAuthClient({
 *   baseURL: API_URL,
 *   fetchOptions: {
 *     credentials: 'include',
 *   },
 * });
 */
export const authClient = createAuthClient({
  baseURL: API_URL,
  fetchOptions: {
    credentials: 'include',
    auth: {
      type: 'Bearer',
      token: () => {
        if (typeof window !== 'undefined') {
          return localStorage.getItem(BEARER_TOKEN_KEY) || '';
        }
        return '';
      },
    },
    onSuccess: (ctx) => {
      // Store bearer token from response headers
      const authToken = ctx.response.headers.get('set-auth-token');
      if (authToken && typeof window !== 'undefined') {
        localStorage.setItem(BEARER_TOKEN_KEY, authToken);
      }
    },
  },
});

// Export individual methods for convenience
export const { signIn, signOut, useSession } = authClient;
