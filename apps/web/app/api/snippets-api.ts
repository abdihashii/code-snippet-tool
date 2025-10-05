import type {
  ApiResponse,
  CreateSnippetPayload,
  GetSnippetByIdResponse,
} from '@snippet-share/types';

import {
  extractRateLimitInfo,
  formatRateLimitMessage,
  RateLimitError,
} from '@/lib/utils';
import { API_URL } from '@/lib/utils/constants';

export async function createSnippet(
  snippet: CreateSnippetPayload,
): Promise<ApiResponse<{ id: string }>> {
  const response = await fetch(`${API_URL}/snippets`, {
    method: 'POST',
    body: JSON.stringify(snippet),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const responseData: ApiResponse<{ id: string }> = await response.json();

  // Check for rate limiting first
  if (response.status === 429) {
    const rateLimitInfo = extractRateLimitInfo(response);
    const message = formatRateLimitMessage(rateLimitInfo);
    throw new RateLimitError(rateLimitInfo, message);
  }

  if (!response.ok || !responseData.success) {
    // Return error response instead of throwing
    return {
      error: 'error' in responseData
        ? responseData.error
        : `HTTP ${response.status}: Failed to create snippet`,
      success: false,
      message: 'error' in responseData ? responseData.message : undefined,
    };
  }

  return responseData; // Return the full ApiResponse<{ id: string }>
}

export async function getSnippetById(
  id: string,
): Promise<ApiResponse<GetSnippetByIdResponse>> {
  const response = await fetch(`${API_URL}/snippets/${id}`);
  const responseData: ApiResponse<GetSnippetByIdResponse> = await response.json();

  // Check for rate limiting first
  if (response.status === 429) {
    const rateLimitInfo = extractRateLimitInfo(response);
    const message = formatRateLimitMessage(rateLimitInfo);
    throw new RateLimitError(rateLimitInfo, message);
  }

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

  return responseData; // Return the full ApiResponse<GetSnippetByIdResponse>
}
