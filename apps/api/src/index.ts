import { WorkersKVStore } from '@hono-rate-limiter/cloudflare';
import { Hono } from 'hono';
import { rateLimiter } from 'hono-rate-limiter';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';

import type { CloudflareBindings } from '@/types/hono-bindings';

import { auth } from '@/routes/auth-routes';
import { snippets } from '@/routes/snippet-routes';

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use('*', cors({
  origin: (_, c) => c.env.FRONTEND_URL,
}));

app.use('*', csrf({
  origin: (_, c) => c.env.FRONTEND_URL,
}));

// Rate limit all requests to 100 requests per 15 minutes
// TODO: Implement tiered global rate limiting when user authentication is added:
// - Anonymous users: 100/15min (current)
// - Signed-up users: 300/15min
// - Premium users: 1000/15min or higher
app.use('*', async (c, next) => {
  // Create rate limiter with store instance per request context
  // This ensures the store has access to the KV namespace binding
  const limiter = rateLimiter<{ Bindings: CloudflareBindings }, '*'>({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: 'draft-6', // Return rate limit info in the `RateLimit-*` headers
    store: new WorkersKVStore({ namespace: c.env.RATE_LIMITER_KV }), // Use Cloudflare KV store
    keyGenerator: (c) => c.env.CF_CONNECTING_IP || c.req.header('x-forwarded-for') || 'anonymous',
  });

  return limiter(c, next);
});

app.get('/ping', () => {
  return new Response('Pong');
});

app.route('/snippets', snippets);
app.route('/auth', auth);

export default app;
