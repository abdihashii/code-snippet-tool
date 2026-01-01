import { z } from 'zod';

// Schema for quick feedback (thumbs up/down)
export const quickFeedbackSchema = z.object({
  type: z.literal('quick'),
  rating: z.number().min(0).max(1), // 0 = thumbs down, 1 = thumbs up
  page: z.string().min(1),
});

// Schema for detailed feedback (dialog form)
export const detailedFeedbackSchema = z.object({
  type: z.literal('detailed'),
  rating: z.number().min(1).max(5), // 1-5 stars
  comment: z.string().max(1000).optional(),
  email: z.string().email().optional().or(z.literal('')),
  page: z.string().min(1),
});

// Combined schema for the API
export const feedbackSchema = z.discriminatedUnion('type', [
  quickFeedbackSchema,
  detailedFeedbackSchema,
]);

export type QuickFeedback = z.infer<typeof quickFeedbackSchema>;
export type DetailedFeedback = z.infer<typeof detailedFeedbackSchema>;
export type Feedback = z.infer<typeof feedbackSchema>;
