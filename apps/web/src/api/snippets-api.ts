import type {
  ApiErrorResponse,
  ApiResponse,
  CreateSnippetPayload,
  GetSnippetByIdResponse,
} from '@snippet-share/types';

const API_URL = 'http://localhost:8787';

export async function createSnippet(
  snippet: CreateSnippetPayload,
): Promise<{ id: string; success: boolean; message: string }> {
  const response = await fetch(`${API_URL}/snippets`, {
    method: 'POST',
    body: JSON.stringify(snippet),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const responseData: ApiResponse<{ id: string }> = await response.json();

  if (!response.ok || !responseData.success) {
    const errorMessage = 'error' in responseData
      ? responseData.error
      : `HTTP ${response.status}: Failed to create snippet`;

    throw new Error(errorMessage);
  }

  return {
    id: responseData.data.id,
    success: true,
    message: responseData.message || 'Snippet created successfully',
  };
}

export async function getSnippetById(
  id: string,
): Promise<GetSnippetByIdResponse | ApiErrorResponse> {
  const response = await fetch(`${API_URL}/snippets/${id}`);
  const responseData: ApiResponse<GetSnippetByIdResponse> = await response.json();

  if (!response.ok || !responseData.success) {
    // For snippet API, we want to return error responses for specific cases
    // (expired, max views, not found) rather than throwing
    if (
      response.status === 410
      || response.status === 403
      || response.status === 404
    ) {
      // Return the standardized error format
      return {
        error: responseData.success === false
          ? responseData.error
          : 'Snippet not available',
        success: false,
        message: responseData.success === false
          ? responseData.message
          : 'This snippet could not be retrieved.',
      };
    }
    // For other unexpected errors, throw to be caught by error boundary
    const errorMessage = !responseData.success
      ? responseData.error
      : 'Failed to get snippet';
    throw new Error(errorMessage);
  }

  return responseData.data;
}
