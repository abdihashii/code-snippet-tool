import { DurableObjectRateLimiter, DurableObjectStore } from '@hono-rate-limiter/cloudflare';
import { Hono } from 'hono';
import { rateLimiter } from 'hono-rate-limiter';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';

import type { CloudflareBindings } from '@/types/hono-bindings';

import { auth } from '@/routes/auth-routes';
import { feedback } from '@/routes/feedback-routes';
import { snippets } from '@/routes/snippet-routes';
import { isDevelopment } from '@/utils/env-utils';

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use('*', cors({
  origin: (_, c) => c.env.FRONTEND_URL,
  exposeHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset', 'RateLimit-Policy', 'Retry-After'],
}));

app.use('*', csrf({
  origin: (_, c) => c.env.FRONTEND_URL,
}));

// Rate limit all requests to 100 requests per 15 minutes
// Skip rate limiting in development mode
// TODO: Implement tiered global rate limiting when user authentication is added:
// - Anonymous users: 100/15min (current)
// - Signed-up users: 300/15min
// - Premium users: 1000/15min or higher
app.use('*', (c, next) => {
  // Skip rate limiting in development mode
  if (isDevelopment(c.env.FRONTEND_URL)) {
    return next();
  }

  return rateLimiter<{ Bindings: CloudflareBindings }>({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    standardHeaders: 'draft-6',
    keyGenerator: (c) => `global:${c.env.CF_CONNECTING_IP || c.req.header('x-forwarded-for') || 'anonymous'}`,
    store: new DurableObjectStore({ namespace: c.env.RATE_LIMITER }),
  })(c, next);
});

app.get('/ping', () => {
  return new Response('Pong');
});

app.route('/snippets', snippets);
app.route('/auth', auth);
app.route('/feedback', feedback);

export default app;
export { DurableObjectRateLimiter };
