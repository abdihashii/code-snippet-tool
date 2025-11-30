import { Hono } from 'hono';

import type { CloudflareBindings } from '@/types/hono-bindings';

import { createAuth } from '@/lib/auth';

export const auth = new Hono<{ Bindings: CloudflareBindings }>();

// Mount Better Auth handler for all auth routes
// Better Auth handles:
// - /api/auth/sign-in/social
// - /api/auth/sign-out
// - /api/auth/session
// - /api/auth/callback/*
// - etc.
auth.on(['POST', 'GET'], '/*', async (c) => {
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

  return authInstance.handler(c.req.raw);
});
