import type {
  CreateSnippetPayload,
  SnippetResponse,
} from '@snippet-share/types';

const API_URL = 'http://localhost:8787';

export async function createSnippet(
  snippet: CreateSnippetPayload,
): Promise<SnippetResponse> {
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

  return response.json() as Promise<SnippetResponse>;
}
