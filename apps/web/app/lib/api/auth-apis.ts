import type { ApiResponse, RateLimitInfo } from '@snippet-share/types';

import { API_URL } from '@/lib/constants';
import { RateLimitService } from '@/lib/services';

export async function signUp(
  email: string,
  password: string,
  confirmPassword: string,
): Promise<ApiResponse<{ userData: any; rateLimitInfo: RateLimitInfo }>> {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    body: JSON.stringify({ email, password, confirmPassword }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Extract rate limit info from headers (available on all responses)
  const rateLimitInfo = RateLimitService.extractRateLimitInfo(response);

  // Check for rate limiting BEFORE parsing JSON
  if (response.status === 429) {
    const message = RateLimitService.formatRateLimitMessage();
    throw new RateLimitService.RateLimitError(rateLimitInfo, message);
  }

  const responseData: ApiResponse<{ userData: any }> = await response.json();

  // Check if the response indicates an error
  if (!response.ok || !responseData.success) {
    const errorMessage = !responseData.success
      ? responseData.error
      : `HTTP ${response.status}: Failed to sign up ${email}`;

    // Return error response instead of throwing
    return {
      error: errorMessage,
      success: false,
      message: !responseData.success ? responseData.message : undefined,
      data: {
        userData: null,
        rateLimitInfo,
      },
    };
  }

  // Return both user data and rate limit info in success response
  return {
    ...responseData,
    data: {
      userData: responseData.data.userData,
      rateLimitInfo,
    },
  };
}
