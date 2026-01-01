import type { Feedback } from '@snippet-share/schemas';

import { API_URL } from '@/lib/constants';

export interface FeedbackResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function submitFeedback(feedback: Feedback): Promise<FeedbackResponse> {
  try {
    const response = await fetch(`${API_URL}/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedback),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data: FeedbackResponse = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to submit feedback',
      };
    }

    return data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return {
      success: false,
      error: 'Failed to submit feedback. Please try again.',
    };
  }
}
