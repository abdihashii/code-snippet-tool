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
  encrypted_content: string; // Encrypted content
  initialization_vector: string; // Initialization vector
  auth_tag: string; // Authentication tag
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
  content: string; // Plaintext content, not encrypted yet
  title: string | null;
  language: Language;
  name: string | null;
  // Number of views, or null for unlimited
  // (as per frontend logic for parsing 'unlimited')
  max_views: number | null;
  // Relative time like '1h', '24h', '7d', or null for 'never'
  expires_at: string | null;
}

export interface CreateSnippetResponse {
  id: string; // uuid
  success: boolean; // true if successful, false if not
  message: string; // 'Snippet created successfully' or error message
}
