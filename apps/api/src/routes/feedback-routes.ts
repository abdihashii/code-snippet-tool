import { feedbackSchema } from '@snippet-share/schemas';
import { Hono } from 'hono';

import type { CloudflareBindings } from '@/types/hono-bindings';

import { getSupabaseClient } from '@/utils/supabase-client';

export const feedback = new Hono<{ Bindings: CloudflareBindings }>();

// POST /feedback - Submit feedback
feedback.post('/', async (c) => {
  const body = await c.req.json();

  // Validate the feedback data
  const validationResult = feedbackSchema.safeParse(body);

  if (!validationResult.success) {
    return c.json({
      error: 'Invalid feedback data',
      details: validationResult.error.flatten(),
      success: false,
    }, 400);
  }

  const feedbackData = validationResult.data;

  try {
    const supabase = getSupabaseClient(c.env);

    // Insert feedback into the database
    const { error } = await supabase
      .from('feedback')
      .insert({
        type: feedbackData.type,
        rating: feedbackData.rating,
        comment: feedbackData.type === 'detailed' ? feedbackData.comment : null,
        email: feedbackData.type === 'detailed' ? feedbackData.email : null,
        page: feedbackData.page,
      });

    if (error) {
      console.error('Error inserting feedback:', error);
      return c.json({
        error: 'Failed to save feedback',
        success: false,
      }, 500);
    }

    return c.json({
      success: true,
      message: 'Thank you for your feedback!',
    }, 201);
  } catch (err) {
    console.error('Error saving feedback:', err);
    return c.json({
      error: 'Failed to save feedback',
      success: false,
    }, 500);
  }
});
