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
      success: false,
    }, 400);
  }

  try {
    // Get the supabase client
    const supabase = getSupabaseClient(c.env);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      // Return 400 for client errors (validation, user already exists, etc.)
      return c.json({
        error: error.message,
        success: false,
      }, 400);
    }

    return c.json({
      userData: data,
      success: true,
    }, 201); // 201 for successful resource creation
  } catch (signupError) {
    return c.json({
      error: `Unknown signup error: ${signupError}`,
      success: false,
    }, 500);
  }
});
