import { Hono } from 'hono';

import type { CloudflareBindings } from '@/types/hono-bindings';

import { getSupabaseClient } from '@/utils/supabase-client';

export const auth = new Hono<{ Bindings: CloudflareBindings }>();

auth.post('/signup', async (c) => {
  // Get the email and passwords from the request body
  const { email, password, confirmPassword } = await c.req.json();

  // Final input validation stage
  if (password !== confirmPassword) {
    return c.json({
      error: 'Both passwords need to be the same.',
    }, 400);
  }

  // Try to sign up the user using the supabase client
  try {
    // Get the supabase client
    const supabase = getSupabaseClient(c.env);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return c.json({ error: `Error signing up the user: ${error}` });
    }

    return c.json({
      userData: data,
    }, 200);
  } catch (signupError) {
    return c.json({
      error: `Unknown signup error: ${signupError}`,
    });
  }
});
