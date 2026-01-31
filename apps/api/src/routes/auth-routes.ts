import { DurableObjectStore } from '@hono-rate-limiter/cloudflare';
import { signupSchema } from '@snippet-share/schemas';
import { Hono } from 'hono';
import { rateLimiter } from 'hono-rate-limiter';

import type { CloudflareBindings } from '@/types/hono-bindings';

import { isDevelopment } from '@/utils/env-utils';
import { getSupabaseClient } from '@/utils/supabase-client';

export const auth = new Hono<{ Bindings: CloudflareBindings }>();

// Rate limit signup attempts to 3 per hour
// Skip rate limiting in development mode
auth.post(
  '/signup',
  (c, next) => {
    // Skip rate limiting in development mode
    if (isDevelopment(c.env.FRONTEND_URL)) {
      return next();
    }

    return rateLimiter<{ Bindings: CloudflareBindings }>({
      windowMs: 60 * 60 * 1000, // 1 hour
      limit: 3,
      standardHeaders: 'draft-6',
      keyGenerator: (c) =>
        `signup:${c.env.CF_CONNECTING_IP
        || c.req.header('x-forwarded-for')
        || 'anonymous'}`,
      store: new DurableObjectStore({ namespace: c.env.RATE_LIMITER }),
    })(c, next);
  },
  async (c) => {
  // Get the email and passwords from the request body
    const body = await c.req.json();

    // Final input validation stage
    const validationResult = signupSchema
      .safeParse(body);

    if (!validationResult.success) {
      return c.json({
        error: validationResult.error.message,
        success: false,
      }, 400);
    }

    const { email, password } = validationResult.data;

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
        data: { userData: data },
        success: true,
        message: 'User registered successfully',
      }, 201); // 201 for successful resource creation
    } catch (signupError) {
      return c.json({
        error: `Unknown signup error: ${signupError}`,
        success: false,
      }, 500);
    }
  },
);
