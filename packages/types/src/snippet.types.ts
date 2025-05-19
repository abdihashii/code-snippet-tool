import type { Language } from './language.types';

export interface Snippet {
  id: string; // uuid
  title: string | null;
  language: Language;
  name: string | null;
  max_views: number | null;
  current_views: number;
  expires_at: string | null; // ISO timestamp string, or null
  created_at: string; // ISO timestamp string
  updated_at: string; // ISO timestamp string

  // Encrypted content and related crypto params
  encrypted_content: string; // Encrypted content
  initialization_vector: string; // Initialization vector
  auth_tag: string; // Authentication tag

  // Optional password protection fields
  encrypted_dek?: string; // Base64 encoded encrypted DEK
  iv_for_dek?: string; // Base64 encoded IV for DEK encryption
  auth_tag_for_dek?: string; // Base64 encoded auth tag for DEK encryption
  kdf_salt?: string; // Base64 encoded salt for KDF
  kdf_parameters?: { // Parameters used for KDF
    iterations: number;
    hash: string; // e.g., 'SHA-256'
  };
}

export interface CreateSnippetPayload {
  // Unencrypted, required fields
  title: string | null;
  language: Language;
  name: string | null;
  // Number of views, or null for unlimited
  // (as per frontend logic for parsing 'unlimited')
  max_views: number | null;
  // Relative time like '1h', '24h', '7d', or null for 'never'
  expires_at: string | null;

  // Encrypted content and related crypto params
  encrypted_content: string; // Base64 encoded encrypted content
  initialization_vector: string; // Base64 encoded IV for content
  auth_tag: string; // Base64 encoded auth tag for content

  // Optional fields for password protection
  encrypted_dek?: string; // Base64 encoded encrypted DEK
  iv_for_dek?: string; // Base64 encoded IV for DEK encryption
  auth_tag_for_dek?: string; // Base64 encoded auth tag for DEK encryption
  kdf_salt?: string; // Base64 encoded salt for KDF
  kdf_parameters?: { // Parameters used for KDF
    iterations: number;
    hash: string; // e.g., 'SHA-256'
  };
}

export interface CreateSnippetResponse {
  id: string; // uuid
  success: boolean; // true if successful, false if not
  message: string; // 'Snippet created successfully' or error message
}

export interface GetSnippetByIdResponse {
  // Unencrypted, required fields
  id: string; // uuid
  title: string | null;
  language: Language;
  name: string | null;
  max_views: number | null;
  current_views: number;
  created_at: string; // ISO timestamp string
  expires_at: string | null; // ISO timestamp string, or null

  // Encrypted content and related crypto params
  encrypted_content: string; // Base64 encoded encrypted content
  initialization_vector: string; // Base64 encoded IV for content
  auth_tag: string; // Base64 encoded auth tag for content

  // Optional password protection fields
  encrypted_dek?: string; // Base64 encoded encrypted DEK
  iv_for_dek?: string; // Base64 encoded IV for DEK encryption
  auth_tag_for_dek?: string; // Base64 encoded auth tag for DEK encryption
  kdf_salt?: string; // Base64 encoded salt for KDF
  kdf_parameters?: { // Parameters used for KDF
    iterations: number;
    hash: string; // e.g., 'SHA-256'
  };
}
