import { cloudflareRateLimiter } from '@hono-rate-limiter/cloudflare';
import { Hono } from 'hono';
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
app.use('*', cloudflareRateLimiter<{ Bindings: CloudflareBindings }>({
  rateLimitBinding: (c) => c.env.GLOBAL_RATE_LIMITER,
  keyGenerator: (c) => c.env.CF_CONNECTING_IP || c.req.header('x-forwarded-for') || 'anonymous',
}));

app.get('/ping', () => {
  return new Response('Pong');
});

app.route('/snippets', snippets);
app.route('/auth', auth);

export default app;
