import { Hono } from 'hono';

const app = new Hono();

app.get('/hello/:name', (c) => {
  const name = c.req.param('name');

  return c.text(`Hello ${name}!`);
});

export default app;
