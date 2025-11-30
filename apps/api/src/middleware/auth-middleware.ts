import type { Context, Next } from 'hono';

import type { CloudflareBindings } from '@/types/hono-bindings';

import { createAuth } from '@/lib/auth';

// Extend Hono context with user session
declare module 'hono' {
  interface ContextVariableMap {
    user: {
      id: string;
      email: string;
      name: string;
      emailVerified: boolean;
      image?: string | null;
    } | null;
    session: {
      id: string;
      userId: string;
      token: string;
      expiresAt: Date;
    } | null;
  }
}

/**
 * Middleware to authenticate requests using Bearer tokens.
 * Extracts user and session from the Authorization header.
 * Sets `c.get('user')` and `c.get('session')` for downstream handlers.
 *
 * @param c - The Hono context.
 * @param next - The next middleware function.
 *
 * @returns A function that can be used as a middleware function.
 */
export async function authMiddleware(
  c: Context<{ Bindings: CloudflareBindings }>,
  next: Next,
) {
  const authInstance = createAuth({
    SUPABASE_DB_URL: c.env.SUPABASE_DB_URL,
    BETTER_AUTH_SECRET: c.env.BETTER_AUTH_SECRET,
    FRONTEND_URL: c.env.FRONTEND_URL,
    API_URL: c.env.API_URL,
    GOOGLE_CLIENT_ID: c.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: c.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: c.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: c.env.GITHUB_CLIENT_SECRET,
  });

  const session = await authInstance.api.getSession({
    headers: c.req.raw.headers,
  });

  if (session) {
    c.set('user', session.user);
    c.set('session', session.session);
  } else {
    c.set('user', null);
    c.set('session', null);
  }

  await next();
}

/**
 * Middleware that requires authentication.
 * Returns 401 Unauthorized if no valid session is found.
 *
 * @param c - The Hono context.
 * @param next - The next middleware function.
 *
 * @returns A function that can be used as a middleware function.
 */
export async function requireAuth(
  c: Context<{ Bindings: CloudflareBindings }>,
  next: Next,
) {
  // First run authMiddleware to populate user/session
  await authMiddleware(c, async () => {});

  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'Unauthorized', success: false }, 401);
  }

  await next();
}
