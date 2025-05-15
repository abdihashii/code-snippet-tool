import type {
  CreateSnippetPayload,
  CreateSnippetResponse,
  GetSnippetByIdResponse,
} from '@snippet-share/types';

const API_URL = 'http://localhost:8787';

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
): Promise<GetSnippetByIdResponse> {
  const response = await fetch(`${API_URL}/snippets/${id}`);

  if (!response.ok) {
    // If the snippet has expired, return the snippet with the expired flag
    if (response.status === 410) {
      return response.json() as Promise<GetSnippetByIdResponse>;
    }
    throw new Error('Failed to get snippet');
  }

  return response.json() as Promise<GetSnippetByIdResponse>;
}
