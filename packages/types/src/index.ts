export type Language =
  | 'PLAINTEXT'
  | 'JSON'
  | 'JAVASCRIPT'
  | 'PYTHON'
  | 'HTML'
  | 'CSS'
  | 'TYPESCRIPT'
  | 'JAVA'
  | 'BASH'
  | 'MARKDOWN'
  | 'CSHARP';

export interface Snippet {
  id: string; // uuid
  encrypted_content: string;
  title: string | null;
  language: Language;
  name: string | null;
  max_views: number | null;
  current_views: number;
  expires_at: string | null; // ISO timestamp string, or null
  created_at: string; // ISO timestamp string
  updated_at: string; // ISO timestamp string
}

export interface CreateSnippetPayload {
  encrypted_content: string;
  title: string | null;
  language: Language;
  name: string | null;
  max_views: number | null; // Number of views, or null for unlimited (as per frontend logic for parsing 'unlimited')
  expires_at: string | null; // Relative time like '1h', '24h', '7d', or null for 'never'
}

export interface SnippetResponse extends Snippet {
  secret_key: string; // uuid
}
