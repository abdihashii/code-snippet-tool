import type {
  CreateSnippetPayload,
  CreateSnippetResponse,
  GetSnippetByIdResponse,
} from '@snippet-share/types';

const API_URL = 'http://localhost:8787';

// Define ApiErrorResponse locally if not available in shared types. This
// matches the structure used in $snippet-id.tsx and returned by the API for
// errors
export interface ApiErrorResponse {
  error: string;
  message: string;
}

export async function createSnippet(
  snippet: CreateSnippetPayload,
): Promise<CreateSnippetResponse> {
  const response = await fetch(`${API_URL}/snippets`, {
    method: 'POST',
    body: JSON.stringify(snippet),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to create snippet');
  }

  return response.json() as Promise<CreateSnippetResponse>;
}

export async function getSnippetById(
  id: string,
): Promise<GetSnippetByIdResponse | ApiErrorResponse> {
  const response = await fetch(`${API_URL}/snippets/${id}`);

  if (!response.ok) {
    // If the snippet has expired (410), reached max views (403), or is not
    // found (404), the API returns a JSON error object. We want to pass this
    // to the component.
    if (
      response.status === 410
      || response.status === 403
      || response.status === 404
    ) {
      return response.json() as Promise<ApiErrorResponse>;
    }
    // For other unexpected errors, throw an error to be caught by router's
    // error boundary
    throw new Error('Failed to get snippet');
  }

  return response.json() as Promise<GetSnippetByIdResponse>;
}
