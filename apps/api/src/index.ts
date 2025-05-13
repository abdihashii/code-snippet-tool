import type { CloudflareBindings } from '@/types/hono-bindings';

import { getSupabaseClient } from '@/utils/supabase-client';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use('*', cors({
  origin: 'http://localhost:3000', // Frontend URL
}));

app.get('/hello/:name', (c) => {
  const name = c.req.param('name');

  return c.text(`Hello ${name}!`);
});

// Create a new snippet
app.post('/snippets', async (c) => {
  const {
    encrypted_content,
    title,
    language,
    name,
    max_views,
  } = await c.req.json();

  const supabase = getSupabaseClient(c.env);

  const { data, error } = await supabase
    .from('snippets')
    .insert(
      {
        encrypted_content,
        title,
        language,
        name,
        max_views,
      },
    )
    .select()
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(data);
});

export default app;
