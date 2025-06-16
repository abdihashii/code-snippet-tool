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
app.use('*', rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: 'draft-6', // Return rate limit info in the `RateLimit-*` headers
  keyGenerator: (c) => (c.env as CloudflareBindings)?.CF_CONNECTING_IP || c.req.header('x-forwarded-for') || 'anonymous',
}));

app.get('/ping', () => {
  return new Response('Pong');
});

app.route('/snippets', snippets);
app.route('/auth', auth);

export default app;
