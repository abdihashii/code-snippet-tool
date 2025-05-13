const API_URL = 'http://localhost:8787';

export interface Snippet {
  encrypted_content: string;
  title: string | null;
  language: string;
  name: string | null;
  max_views: number | null;
  expires_at: string | null;
}

export async function createSnippet(snippet: Snippet) {
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

  return response.json();
}
