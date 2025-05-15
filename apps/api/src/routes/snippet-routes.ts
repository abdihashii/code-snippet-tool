import type {
  CreateSnippetPayload,
  GetSnippetByIdResponse,
  Snippet,
} from '@snippet-share/types';

import { addDays, addHours, isPast } from 'date-fns';
import { Hono } from 'hono';
import { Buffer } from 'node:buffer';

import type { CloudflareBindings } from '@/types/hono-bindings';
import type { EncryptedTextOutput } from '@/utils/encryption-utils';

import {
  decryptText,

  encryptText,
  generateInitializationVector,
  getEncryptionKey,
} from '@/utils/encryption-utils';
import { getSupabaseClient } from '@/utils/supabase-client';

export const snippets = new Hono<{ Bindings: CloudflareBindings }>();

// --- Helper functions for bytea string conversion ---

/**
 * Converts a Buffer to a PostgreSQL bytea hex string format
 * (e.g., "\\x[hex_string]").
 *
 * @param {Buffer} buffer The buffer to convert.
 * @returns {string} The bytea hex string.
 */
function bufferToPostgresByteaString(buffer: Buffer): string {
  return `\\x${buffer.toString('hex')}`;
}

/**
 * Converts a PostgreSQL bytea hex string (e.g., "\\x[hex_string]") to a
 * Buffer.
 *
 * @param {string | null | undefined} byteaString The bytea hex string.
 * @returns {Buffer} The resulting buffer.
 * @throws {Error} If the string format is invalid.
 */
function postgresByteaStringToBuffer(
  byteaString: string | null | undefined,
): Buffer {
  if (!byteaString) {
    throw new Error('Invalid bytea string: cannot be null or undefined.');
  }
  if (!byteaString.startsWith('\\x')) {
    throw new Error(
      `Invalid bytea string format: must start with "\\x". Provided: ${byteaString.substring(0, 10)}`,
    );
  }
  return Buffer.from(byteaString.substring(2), 'hex');
}

// --- End of helper functions ---

// Create a new snippet
snippets.post('/', async (c) => {
  const {
    content,
    title,
    language,
    name,
    max_views,
    expires_at, // This will be a string like '1h', '24h', '7d', or null
  } = await c.req.json<CreateSnippetPayload>();

  let expires_at_timestamp: string | null = null;

  if (expires_at) {
    const now = new Date();
    if (expires_at === '1h') {
      expires_at_timestamp = addHours(now, 1).toISOString();
    } else if (expires_at === '24h') {
      expires_at_timestamp = addDays(now, 1).toISOString();
    } else if (expires_at === '7d') {
      expires_at_timestamp = addDays(now, 7).toISOString();
    } else {
      // Invalid expires_at string, could return 400 Bad Request
      // For now, it will remain null if not recognized.
      console.warn(`Unrecognized expires_at value: ${expires_at}`);
    }
  }

  try {
    // Get the encryption key
    const key = getEncryptionKey(c.env.ENCRYPTION_KEY);

    // Generate a unique, cryptographically secure IV for this content
    const ivBuffer = generateInitializationVector();

    // Encrypt the plaintext content
    const encryptedOutput: EncryptedTextOutput = encryptText(
      content,
      key,
      ivBuffer,
    );

    // Get the supabase client
    const supabase = getSupabaseClient(c.env);

    // Save the snippet to the database with the encrypted content
    // Convert Buffers to PostgreSQL bytea hex string format for storage
    const { data, error } = await supabase
      .from('snippets')
      .insert({
        encrypted_content: bufferToPostgresByteaString(
          encryptedOutput.ciphertext,
        ),
        initialization_vector: bufferToPostgresByteaString(
          encryptedOutput.initialization_vector,
        ),
        auth_tag: bufferToPostgresByteaString(encryptedOutput.auth_tag),
        title,
        language,
        name,
        max_views,
        expires_at: expires_at_timestamp,
      })
      .select('id') // Only select the ID, or whatever minimal data is needed
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return c.json(
        {
          error: `Failed to create snippet: ${error.message}`,
        },
        500,
      );
    }

    return c.json({
      id: data.id,
      success: true,
      message: 'Snippet created successfully',
    });
  } catch (e) {
    const err = e as Error;
    console.error('Error during snippet creation:', err);
    // Provide a more generic error to the client
    return c.json(
      {
        error: `An unexpected error occurred: ${err.message}`,
      },
      500,
    );
  }
});

// Get a snippet by ID
snippets.get('/:id', async (c) => {
  const snippetId = c.req.param('id');

  if (!snippetId) {
    return c.json({ error: 'Snippet ID is required' }, 400);
  }

  // Get the supabase client
  const supabase = getSupabaseClient(c.env);

  // 1. Fetch the snippet data from the database
  const { data: snippet, error: fetchError } = await supabase
    .from('snippets')
    .select('*') // Select all columns needed for decryption and display
    .eq('id', snippetId)
    .single();

  if (fetchError || !snippet) {
    console.error(`Error fetching snippet ${snippetId}:`, fetchError?.message);
    return c.json(
      {
        error: 'Snippet not found or access denied',
      },
      404,
    ); // More generic error message for security
  }

  // Cast to the Snippet type (ensure this type expects string for bytea fields)
  const typedSnippet = snippet as Snippet;

  // 2. Check for expiration
  if (typedSnippet.expires_at && isPast(new Date(typedSnippet.expires_at))) {
    // Optional: implement deletion logic here or via a scheduled task
    return c.json({
      error: 'Snippet expired',
      message: 'This snippet has expired and is no longer available.',
    }, 410);
  }

  // 3. Check for max views
  // This section can introduce race conditions if not handled carefully.
  // For high-traffic, consider more robust atomic operations if Supabase
  // supports them for this, or server-side functions.
  if (typedSnippet.max_views !== null) {
    if (typedSnippet.current_views >= typedSnippet.max_views) {
      return c.json({
        error: 'Snippet has reached its maximum view limit.',
        message: 'This snippet has been viewed the maximum number of times and is no longer available.',
      }, 403); // 403 Forbidden
    }

    // Increment the view count
    const { error: updateError } = await supabase
      .from('snippets')
      .update({ current_views: typedSnippet.current_views + 1 })
      .eq('id', snippetId);

    if (updateError) {
      console.error(
        `Error incrementing view count for snippet ${snippetId}:`,
        updateError.message,
      );
      // TODO: Decide if this is a fatal error. For now, proceed but log.
      // In a stricter system, you might return 500.
    }
  }

  // 4. Decrypt the content
  try {
    const key = getEncryptionKey(c.env.ENCRYPTION_KEY);

    // Convert stored bytea hex strings back to Buffers
    // The 'as string' cast assumes your Snippet type correctly defines these
    // as strings
    const ciphertext = postgresByteaStringToBuffer(
      typedSnippet.encrypted_content as string,
    );
    const initializationVector = postgresByteaStringToBuffer(
      typedSnippet.initialization_vector as string,
    );
    const authTag = postgresByteaStringToBuffer(
      typedSnippet.auth_tag as string,
    );

    const decryptedContent = decryptText(
      ciphertext,
      key,
      initializationVector,
      authTag,
    );

    const response: GetSnippetByIdResponse = {
      id: typedSnippet.id,
      title: typedSnippet.title,
      language: typedSnippet.language,
      name: typedSnippet.name,
      content: decryptedContent,
      created_at: typedSnippet.created_at,
      expires_at: typedSnippet.expires_at,
      max_views: typedSnippet.max_views,
      current_views: typedSnippet.current_views,
    };

    // 5. Return the decrypted content and relevant metadata
    return c.json(response);
  } catch (decryptionOrConversionError) {
    const err = decryptionOrConversionError as Error;
    console.error(`Processing failed for snippet ${snippetId}:`, err.message);
    return c.json(
      {
        error: 'Failed to process snippet. It may be corrupted or the link is invalid.',
      },
      500, // Internal Server Error for decryption/conversion failures
    );
  }
});
