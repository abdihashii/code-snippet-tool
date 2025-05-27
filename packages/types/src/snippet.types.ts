import type { Language } from './language.types';

// Base fields shared by all snippet interfaces
interface SnippetBase {
  title: string | null;
  language: Language;
  name: string | null;
  max_views: number | null;
}

// Encryption fields shared by all snippet interfaces
interface SnippetEncryption {
  encrypted_content: string; // Encrypted content
  initialization_vector: string; // Initialization vector
  auth_tag: string; // Authentication tag
}

// Optional password protection fields shared by all snippet interfaces
interface SnippetPasswordProtection {
  encrypted_dek?: string; // Base64 encoded encrypted DEK
  iv_for_dek?: string; // Base64 encoded IV for DEK encryption
  auth_tag_for_dek?: string; // Base64 encoded auth tag for DEK encryption
  kdf_salt?: string; // Base64 encoded salt for KDF
  kdf_parameters?: { // Parameters used for KDF
    iterations: number;
    hash: string; // e.g., 'SHA-256'
  };
}

export interface Snippet
  extends SnippetBase, SnippetEncryption, SnippetPasswordProtection {
  id: string; // uuid
  current_views: number;
  expires_at: string | null; // ISO timestamp string, or null
  created_at: string; // ISO timestamp string
  updated_at: string; // ISO timestamp string
}

export interface CreateSnippetPayload
  extends SnippetBase, SnippetEncryption, SnippetPasswordProtection {
  // Relative time like '1h', '24h', '7d', or null for 'never'
  expires_at: string | null;

  // Override the base encryption fields with specific comments for API payload
  // These are Base64 encoded for transmission
  encrypted_content: string; // Base64 encoded encrypted content
  initialization_vector: string; // Base64 encoded IV for content
  auth_tag: string; // Base64 encoded auth tag for content
}

export interface GetSnippetByIdResponse
  extends SnippetBase, SnippetEncryption, SnippetPasswordProtection {
  id: string; // uuid
  current_views: number;
  created_at: string; // ISO timestamp string
  expires_at: string | null; // ISO timestamp string, or null

  // Override the base encryption fields with specific comments for API
  // response. These are Base64 encoded for client-side decryption
  encrypted_content: string; // Base64 encoded encrypted content
  initialization_vector: string; // Base64 encoded IV for content
  auth_tag: string; // Base64 encoded auth tag for content
}
