import type { ApiResponse } from '@snippet-share/types';

import { API_URL } from '@/lib/constants';
import {
  extractRateLimitInfo,
  formatRateLimitMessage,
  RateLimitError,
} from '@/lib/utils';

export async function signUp(
  email: string,
  password: string,
  confirmPassword: string,
) {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    body: JSON.stringify({ email, password, confirmPassword }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const responseData: ApiResponse<{ userData: any }> = await response.json();

  // Check for rate limiting first
  if (response.status === 429) {
    const rateLimitInfo = extractRateLimitInfo(response);
    const message = formatRateLimitMessage(rateLimitInfo);
    throw new RateLimitError(rateLimitInfo, message);
  }

  // Check if the response indicates an error
  if (!response.ok || !responseData.success) {
    const errorMessage = !responseData.success
      ? responseData.error
      : `HTTP ${response.status}: Failed to sign up ${email}`;

    throw new Error(errorMessage);
  }

  return responseData.data.userData;
}
