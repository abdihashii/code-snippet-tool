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

app.get('/ping', () => {
  return new Response('Pong');
});

app.route('/snippets', snippets);
app.route('/auth', auth);

export default app;
