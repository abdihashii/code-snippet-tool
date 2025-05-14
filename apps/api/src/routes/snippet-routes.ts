import type { CreateSnippetPayload } from '@snippet-share/types';

import { addDays, addHours } from 'date-fns';
import { Hono } from 'hono';

import type { CloudflareBindings } from '@/types/hono-bindings';

import { getSupabaseClient } from '@/utils/supabase-client';

export const snippets = new Hono<{ Bindings: CloudflareBindings }>();

// Create a new snippet
snippets.post('/', async (c) => {
  const {
    encrypted_content,
    title,
    language,
    name,
    max_views,
    expires_at, // This will be a string like '1h', '24h', '7d', or null
  } = await c.req.json<CreateSnippetPayload>();

  let expires_at_timestamp: string | null = null;

  if (expires_at) {
    const now = new Date();
    if (expires_at === '1h') {
      expires_at_timestamp = addHours(now, 1).toISOString();
    } else if (expires_at === '24h') {
      expires_at_timestamp = addHours(now, 24).toISOString(); // or addDays(now, 1)
    } else if (expires_at === '7d') {
      expires_at_timestamp = addDays(now, 7).toISOString();
    } else {
      // Handle potentially invalid string or keep as null if not recognized
      // For now, if it's not one of the expected values and not null, it will remain null
      // or you could return an error.
    }
  }

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
        expires_at: expires_at_timestamp, // Use the calculated timestamp
      },
    )
    .select()
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(data);
});
