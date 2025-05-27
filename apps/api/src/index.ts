import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';

import { auth } from '@/routes/auth-routes';
import { snippets } from '@/routes/snippet-routes';

const app = new Hono();

app.use('*', cors({
  origin: 'http://localhost:3000', // Frontend URL
}));

app.use('*', csrf({
  origin: 'http://localhost:3000',
}));

app.get('/ping', () => {
  return new Response('Pong');
});

app.route('/snippets', snippets);
app.route('/auth', auth);

export default app;
