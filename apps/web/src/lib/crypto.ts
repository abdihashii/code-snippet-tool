import { Buffer } from 'node:buffer';

interface DecryptSnippetParams {
  encryptedContent: string;
  iv: string;
  authTag: string;
  dek?: string;
  encryptedDek?: string;
  ivForDek?: string;
  authTagForDek?: string;
  kdfSalt?: string;
  kdfParameters?: {
    iterations: number;
    hash: string;
  };
  password?: string;
}

/**
 * Decrypts a snippet.
 * This function handles both regular snippets (where the DEK is provided
 * directly) and password-protected snippets (where the DEK is encrypted and
 * needs to be decrypted using a KEK derived from a password).
 *
 * @param params - The parameters for decryption.
 * @param params.encryptedContent - The Base64 encoded encrypted content of
 * the snippet.
 * @param params.iv - The Base64 encoded initialization vector used for
 * encrypting the content.
 * @param params.authTag - The Base64 encoded authentication tag for the
 * encrypted content.
 * @param params.dek - Optional. The Base64url encoded Data Encryption Key.
 * Used for non-password-protected snippets.
 * @param params.encryptedDek - Optional. The Base64 encoded encrypted Data
 * Encryption Key. Used for password-protected snippets.
 * @param params.ivForDek - Optional. The Base64 encoded initialization vector
 * used for encrypting the DEK.
 * @param params.authTagForDek - Optional. The Base64 encoded authentication
 * tag for the encrypted DEK.
 * @param params.kdfSalt - Optional. The Base64 encoded salt used for Key
 * Derivation Function (KDF) when deriving KEK from password.
 * @param params.kdfParameters - Optional. Parameters for the KDF.
 * @param params.kdfParameters.iterations - The number of iterations for
 * PBKDF2.
 * @param params.kdfParameters.hash - The hash algorithm used for PBKDF2
 * (e.g., 'SHA-256').
 * @param params.password - Optional. The password to derive the Key Encryption
 * Key (KEK) for password-protected snippets.
 * @returns A promise that resolves to the decrypted content as a string.
 * @throws Will throw an error if decryption parameters are invalid or
 * decryption fails.
 */
export async function decryptSnippet({
  encryptedContent,
  iv,
  authTag,
  dek,
  encryptedDek,
  ivForDek,
  authTagForDek,
  kdfSalt,
  kdfParameters,
  password,
}: DecryptSnippetParams): Promise<string> {
  // Convert Base64 strings to ArrayBuffers
  const encryptedContentBuffer = Buffer.from(encryptedContent, 'base64');
  const ivBuffer = Buffer.from(iv, 'base64');
  const authTagBuffer = Buffer.from(authTag, 'base64');

  let finalDek: ArrayBuffer;

  if (dek) {
    // For regular snippets, use the DEK directly from the URL
    // Convert base64url to standard base64
    let base64Dek = dek.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if necessary
    while (base64Dek.length % 4) {
      base64Dek += '=';
    }
    finalDek = Buffer.from(base64Dek, 'base64');
  } else if (
    password
    && encryptedDek
    && ivForDek
    && authTagForDek
    && kdfSalt
    && kdfParameters
  ) {
    // For password-protected snippets, derive the KEK and decrypt the DEK
    const encryptedDekBuffer = Buffer.from(encryptedDek, 'base64');
    const ivForDekBuffer = Buffer.from(ivForDek, 'base64');
    const authTagForDekBuffer = Buffer.from(authTagForDek, 'base64');
    const kdfSaltBuffer = Buffer.from(kdfSalt, 'base64');

    // Derive the KEK from the password
    const kek = await deriveKeyFromPassword(
      password,
      kdfSaltBuffer,
      kdfParameters.iterations,
      kdfParameters.hash,
    );

    // Decrypt the DEK using the KEK
    finalDek = await decryptDek(
      encryptedDekBuffer,
      kek,
      ivForDekBuffer,
      authTagForDekBuffer,
    );
  } else {
    throw new Error('Invalid decryption parameters');
  }

  // Decrypt the content using the final DEK
  const decryptedContent = await decryptContent(
    encryptedContentBuffer,
    finalDek,
    ivBuffer,
    authTagBuffer,
  );

  return decryptedContent;
}

/**
 * Derives a cryptographic key from a user-provided password using PBKDF2.
 *
 * @param password - The password to derive the key from.
 * @param salt - An ArrayBuffer containing the salt for PBKDF2. This should be
 * a cryptographically random value.
 * @param iterations - The number of iterations for PBKDF2. A higher number
 * increases security but also derivation time.
 * @param hash - The hash function to use with PBKDF2 (e.g., 'SHA-256',
 * 'SHA-512').
 * @returns A promise that resolves to an ArrayBuffer containing the derived
 * key (256 bits).
 */
async function deriveKeyFromPassword(
  password: string,
  salt: ArrayBuffer,
  iterations: number,
  hash: string,
): Promise<ArrayBuffer> {
  // Encode the password
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import the password as a raw key
  const key = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey'],
  );

  // Derive the key using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash,
    },
    key,
    256, // 256 bits = 32 bytes for AES-256
  );

  return derivedBits;
}

/**
 * Decrypts an encrypted Data Encryption Key (DEK) using a Key Encryption Key
 * (KEK).
 * This is used for password-protected snippets.
 * Assumes AES-GCM was used for encrypting the DEK.
 *
 * @param encryptedDek - An ArrayBuffer containing the encrypted DEK.
 * @param kek - An ArrayBuffer containing the Key Encryption Key.
 * @param iv - An ArrayBuffer containing the Initialization Vector used for
 * DEK encryption.
 * @param authTag - An ArrayBuffer containing the Authentication Tag for the
 * encrypted DEK.
 * @returns A promise that resolves to an ArrayBuffer containing the decrypted
 * DEK.
 * @throws Will throw an error if DEK decryption fails (e.g., due to incorrect
 * KEK or tampered data).
 */
async function decryptDek(
  encryptedDek: ArrayBuffer,
  kek: ArrayBuffer,
  iv: ArrayBuffer,
  authTag: ArrayBuffer,
): Promise<ArrayBuffer> {
  // Import the KEK as a raw key
  const key = await crypto.subtle.importKey(
    'raw',
    kek,
    { name: 'AES-GCM' },
    false,
    ['decrypt'],
  );

  // Create a new Uint8Array to hold the encrypted DEK and auth tag
  const encryptedData = new Uint8Array(
    encryptedDek.byteLength + authTag.byteLength,
  );
  encryptedData.set(new Uint8Array(encryptedDek), 0);
  encryptedData.set(new Uint8Array(authTag), encryptedDek.byteLength);

  try {
    // Decrypt the DEK
    const decryptedDek = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encryptedData,
    );
    return decryptedDek;
  } catch (e) {
    console.error('Decryption failed in decryptDek:', e);
    // For debugging, rethrow or return a marker. For now, rethrow.
    throw e;
  }
}

/**
 * Decrypts content using a Data Encryption Key (DEK).
 * Assumes AES-GCM was used for encrypting the content.
 *
 * @param encryptedContentAB - An ArrayBuffer containing the encrypted content.
 * @param dekAB - An ArrayBuffer containing the Data Encryption Key.
 * @param ivAB - An ArrayBuffer containing the Initialization Vector used for
 * content encryption.
 * @param authTagAB - An ArrayBuffer containing the Authentication Tag for the
 * encrypted content.
 * @returns A promise that resolves to the decrypted content as a string.
 * If decryption fails, it returns a specific error marker string for
 * debugging.
 */
async function decryptContent(
  encryptedContentAB: ArrayBuffer,
  dekAB: ArrayBuffer,
  ivAB: ArrayBuffer,
  authTagAB: ArrayBuffer,
): Promise<string> {
  // Import the DEK as a raw key
  const key = await crypto.subtle.importKey(
    'raw',
    dekAB,
    { name: 'AES-GCM' },
    false,
    ['decrypt'],
  );

  // Create a new Uint8Array to hold the encrypted content and auth tag
  const encryptedDataWithAuthTag = new Uint8Array(
    encryptedContentAB.byteLength + authTagAB.byteLength,
  );
  encryptedDataWithAuthTag.set(new Uint8Array(encryptedContentAB), 0);
  encryptedDataWithAuthTag.set(new Uint8Array(
    authTagAB,
  ), encryptedContentAB.byteLength);

  try {
    // Decrypt the content
    const decryptedArrayBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivAB,
      },
      key,
      encryptedDataWithAuthTag,
    );
    return new TextDecoder().decode(decryptedArrayBuffer);
  } catch (e) {
    console.error('Decryption failed in decryptContent:', e);
    return 'DECRYPTION_FAILED_IN_DECRYPT_CONTENT'; // Test marker for debugging
  }
}
