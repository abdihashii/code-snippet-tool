import { betterAuth } from 'better-auth';
import { bearer } from 'better-auth/plugins';
import { Pool } from 'pg';

export interface AuthEnv {
  SUPABASE_DB_URL: string;
  BETTER_AUTH_SECRET: string;
  FRONTEND_URL: string;
  API_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}

/**
 * Factory function to create a Better Auth instance with Cloudflare environment bindings.
 * Called per-request since Cloudflare Workers are stateless.
 *
 * @param env - The environment variables for the application.
 * @returns A Better Auth instance.
 *
 * @see https://www.better-auth.com/docs/installation#create-a-better-auth-instance
 *
 * @example
 * const auth = createAuth({
 *   env: {
 *     SUPABASE_DB_URL: 'https://your-supabase-db-url.com',
 *     BETTER_AUTH_SECRET: 'your-better-auth-secret',
 *     FRONTEND_URL: 'https://your-frontend-url.com',
 *     API_URL: 'https://your-api-url.com',
 *   },
 * });
 */
export function createAuth(env: AuthEnv) {
  return betterAuth({
    database: new Pool({
      connectionString: env.SUPABASE_DB_URL,
      ssl: { rejectUnauthorized: false },
    }),

    baseURL: env.API_URL,
    basePath: '/api/auth',
    secret: env.BETTER_AUTH_SECRET,

    trustedOrigins: [env.FRONTEND_URL],

    // OAuth only - no email/password
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },

    plugins: [
      bearer(),
    ],

    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day - session extended when this threshold is reached
    },

    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ['google', 'github'],
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
