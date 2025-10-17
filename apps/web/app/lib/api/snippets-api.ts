import type {
  ApiResponse,
  CreateSnippetPayload,
  GetSnippetByIdResponse,
  RateLimitInfo,
} from '@snippet-share/types';

import { API_URL } from '@/lib/constants';
import {
  RateLimitService,
} from '@/lib/services';

export async function createSnippet(
  snippet: CreateSnippetPayload,
): Promise<ApiResponse<{ id: string; rateLimitInfo?: RateLimitInfo }>> {
  const response = await fetch(`${API_URL}/snippets`, {
    method: 'POST',
    body: JSON.stringify(snippet),
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

  const responseData: ApiResponse<{ id: string }> = await response.json();

  if (!response.ok || !responseData.success) {
    // Return error response instead of throwing
    return {
      error: 'error' in responseData
        ? responseData.error
        : `HTTP ${response.status}: Failed to create snippet`,
      success: false,
      message: 'error' in responseData ? responseData.message : undefined,
      data: {
        id: '',
        rateLimitInfo,
      },
    };
  }

  // Attach rate limit info to successful response
  return {
    ...responseData,
    data: {
      ...responseData.data,
      rateLimitInfo,
    },
  };
}

export async function getSnippetById(
  id: string,
): Promise<ApiResponse<GetSnippetByIdResponse & { rateLimitInfo?: RateLimitInfo }>> {
  const response = await fetch(`${API_URL}/snippets/${id}`);

  // Extract rate limit info from headers (available on all responses)
  const rateLimitInfo = RateLimitService.extractRateLimitInfo(response);

  // Check for rate limiting BEFORE parsing JSON
  if (response.status === 429) {
    const message = RateLimitService.formatRateLimitMessage();
    throw new RateLimitService.RateLimitError(rateLimitInfo, message);
  }

  const responseData: ApiResponse<GetSnippetByIdResponse> = await response.json();

  if (!response.ok || !responseData.success) {
    // Return error response instead of throwing or mixing types
    return {
      error: responseData.success === false ? responseData.error : 'Snippet not available',
      success: false,
      message: responseData.success === false
        ? responseData.message
        : 'This snippet could not be retrieved.',
    };
  }

  // Attach rate limit info to successful response
  return {
    ...responseData,
    data: {
      ...responseData.data,
      rateLimitInfo,
    },
  };
}
