import type {
  CreateSnippetPayload,
  GetSnippetByIdResponse,
  Snippet,
} from '@snippet-share/types';

import { addDays, addHours, isPast } from 'date-fns';
import { Hono } from 'hono';
import { rateLimiter } from 'hono-rate-limiter';
import { Buffer } from 'node:buffer';

import type { CloudflareBindings } from '@/types/hono-bindings';

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

// Create a new snippet. Rate limit to 5 snippet creations per day per IP.
// TODO: Implement tiered rate limiting when user authentication is added:
// - Anonymous users: 5/day
// - Signed-up users: 25/day  
// - Premium users: 100/day
snippets.post('/', rateLimiter({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  limit: 5, // Limit each IP to 5 snippet creations per day
  standardHeaders: 'draft-6',
  keyGenerator: (c) =>
    (c.env as CloudflareBindings)?.CF_CONNECTING_IP
    || c.req.header('x-forwarded-for')
    || 'anonymous',
}), async (c) => {
  const {
    encrypted_content, // Comes in as a base64 encoded string
    initialization_vector, // Comes in as a base64 encoded string
    auth_tag, // Comes in as a base64 encoded string
    title,
    language,
    name,
    max_views,
    expires_at, // This will be a string like '1h', '24h', '7d', or null

    // Optional password protection fields
    encrypted_dek,
    iv_for_dek,
    auth_tag_for_dek,
    kdf_salt,
    kdf_parameters,
  } = await c.req.json<CreateSnippetPayload>();

  let expires_at_timestamp: string | null = null;

  // Convert expires_at from a relative time string to a timestamp if it exists
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
    // Get the supabase client
    const supabase = getSupabaseClient(c.env);

    // Prepare the encrypted content and related crypto params to be converted
    // to PostgreSQL bytea hex strings by first converting them to Buffers.
    const encryptedContentBuffer = Buffer.from(encrypted_content, 'base64');
    const ivBuffer = Buffer.from(initialization_vector, 'base64');
    const authTagBuffer = Buffer.from(auth_tag, 'base64');

    // Prepare the base insert data
    const insertData: Record<string, any> = {
      // Unencrypted, required fields
      title,
      language,
      name,
      max_views,
      expires_at: expires_at_timestamp,

      // Encrypted content and related crypto params converted to PostgreSQL
      // bytea hex strings from Buffers.
      encrypted_content: bufferToPostgresByteaString(encryptedContentBuffer),
      initialization_vector: bufferToPostgresByteaString(ivBuffer),
      auth_tag: bufferToPostgresByteaString(authTagBuffer),
    };

    // Add password protection fields if they exist
    if (
      encrypted_dek
      && iv_for_dek
      && auth_tag_for_dek
      && kdf_salt
      && kdf_parameters
    ) {
      // Prepare the password protection fields to be converted to PostgreSQL
      // bytea hex strings from Buffers.
      const encryptedDekBuffer = Buffer.from(encrypted_dek, 'base64');
      const ivForDekBuffer = Buffer.from(iv_for_dek, 'base64');
      const authTagForDekBuffer = Buffer.from(auth_tag_for_dek, 'base64');
      const kdfSaltBuffer = Buffer.from(kdf_salt, 'base64');

      Object.assign(insertData, {
        // Encrypted DEK and related crypto params converted to PostgreSQL
        // bytea hex strings from Buffers.
        encrypted_dek: bufferToPostgresByteaString(encryptedDekBuffer),
        iv_for_dek: bufferToPostgresByteaString(ivForDekBuffer),
        auth_tag_for_dek: bufferToPostgresByteaString(authTagForDekBuffer),
        kdf_salt: bufferToPostgresByteaString(kdfSaltBuffer),

        kdf_parameters,
      });
    }

    // Save the items to the database, including the encrypted content and
    // related crypto params converted to PostgreSQL bytea hex strings.
    const { data, error } = await supabase
      .from('snippets')
      .insert(insertData)
      .select('id')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return c.json(
        {
          error: `Failed to create snippet: ${error.message}`,
          success: false,
        },
        500,
      );
    }

    return c.json({
      data: { id: data.id },
      success: true,
      message: 'Snippet created successfully',
    }, 201);
  } catch (e) {
    const err = e as Error;
    console.error('Error during snippet creation:', err);
    // Provide a more generic error to the client
    return c.json(
      {
        error: `An unexpected error occurred: ${err.message}`,
        success: false,
      },
      500,
    );
  }
});

// Get a snippet by ID. Rate limit to 50 snippet retrievals per minute per IP.
// TODO: Consider tiered rate limiting for snippet retrieval when user authentication is added:
// - Anonymous users: 50/minute (current)
// - Signed-up users: 100/minute
// - Premium users: 500/minute or unlimited
snippets.get('/:id', rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  limit: 50, // Limit each IP to 50 snippet retrievals per minute
  standardHeaders: 'draft-6',
  keyGenerator: (c) =>
    (c.env as CloudflareBindings)?.CF_CONNECTING_IP
    || c.req.header('x-forwarded-for')
    || 'anonymous',
}), async (c) => {
  const snippetId = c.req.param('id');

  if (!snippetId) {
    return c.json({
      error: 'Snippet ID is required',
      success: false,
    }, 400);
  }

  // Get the supabase client
  const supabase = getSupabaseClient(c.env);

  // 1. Fetch the snippet data from the database
  const { data: snippet, error: fetchError } = await supabase
    .from('snippets')
    .select('*')
    .eq('id', snippetId)
    .single();

  if (fetchError || !snippet) {
    console.error(`Error fetching snippet ${snippetId}:`, fetchError?.message);
    return c.json(
      {
        error: 'Snippet not found or access denied',
        success: false,
      },
      404,
    ); // More generic error message for security
  }

  // Cast to the Snippet type
  // (ensure this type expects string for bytea fields)
  const typedSnippet = snippet as Snippet;

  // 2. Check for expiration
  if (typedSnippet.expires_at && isPast(new Date(typedSnippet.expires_at))) {
    // Optional: implement deletion logic here or via a scheduled task
    return c.json({
      error: 'Snippet expired',
      success: false,
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
        success: false,
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

  // 4. Convert bytea hex strings to Base64 for client-side decryption
  try {
    const response: GetSnippetByIdResponse = {
      // Unencrypted, required fields
      id: typedSnippet.id,
      title: typedSnippet.title,
      language: typedSnippet.language,
      name: typedSnippet.name,
      max_views: typedSnippet.max_views,
      current_views: typedSnippet.current_views,
      created_at: typedSnippet.created_at,
      expires_at: typedSnippet.expires_at,

      // Convert bytea hex strings to Base64 for client-side decryption
      encrypted_content: Buffer.from(
        postgresByteaStringToBuffer(typedSnippet.encrypted_content as string),
      ).toString('base64'),
      initialization_vector: Buffer.from(
        postgresByteaStringToBuffer(
          typedSnippet.initialization_vector as string,
        ),
      ).toString('base64'),
      auth_tag: Buffer.from(
        postgresByteaStringToBuffer(typedSnippet.auth_tag as string),
      ).toString('base64'),
    };

    // Add password protection fields if they exist
    if (
      typedSnippet.encrypted_dek
      && typedSnippet.iv_for_dek
      && typedSnippet.auth_tag_for_dek
      && typedSnippet.kdf_salt
      && typedSnippet.kdf_parameters
    ) {
      Object.assign(response, {
        // Encrypted DEK and related crypto params converted to Base64
        // for client-side decryption.
        encrypted_dek: Buffer.from(postgresByteaStringToBuffer(
          typedSnippet.encrypted_dek as string,
        )).toString('base64'),
        iv_for_dek: Buffer.from(postgresByteaStringToBuffer(
          typedSnippet.iv_for_dek as string,
        )).toString('base64'),
        auth_tag_for_dek: Buffer.from(postgresByteaStringToBuffer(
          typedSnippet.auth_tag_for_dek as string,
        )).toString('base64'),
        kdf_salt: Buffer.from(postgresByteaStringToBuffer(
          typedSnippet.kdf_salt as string,
        )).toString('base64'),

        kdf_parameters: typedSnippet.kdf_parameters,
      });
    }

    return c.json({
      data: response,
      success: true,
    });
  } catch (conversionError) {
    const err = conversionError as Error;
    console.error(`Processing failed for snippet ${snippetId}:`, err.message);
    return c.json(
      {
        error: 'Failed to process snippet. It may be corrupted or the link is invalid.',
        success: false,
      },
      500, // Internal Server Error for conversion failures
    );
  }
});
