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
 * Converts a Base64 string to an ArrayBuffer.
 *
 * @param base64 - The Base64 string to convert.
 * @returns An ArrayBuffer containing the decoded binary data.
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  // Convert the Base64 string to a binary string using atob.
  const binaryString = atob(base64);

  // Create a new Uint8Array with the same length as the binary string.
  const bytes = new Uint8Array(binaryString.length);

  // Fill the Uint8Array with the character codes of the binary string.
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Return the buffer of the Uint8Array.
  return bytes.buffer;
}

/**
 * Converts a Base64url string to a Base64 string.
 *
 * @param base64url - The Base64url string to convert.
 * @returns A Base64 string.
 */
function base64urlToBase64(base64url: string): string {
  // Replace the URL-safe characters with the standard Base64 characters.
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');

  // Add padding if necessary.
  const padding = (4 - (base64.length % 4)) % 4;

  // Return the Base64 string with the padding added.
  return base64 + '='.repeat(padding);
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
 * @param params.kdfParameters - Optional. Parameters for the KDF with properties: iterations
 * (number of iterations for PBKDF2) and hash (hash algorithm used for PBKDF2, e.g., 'SHA-256').
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
  const encryptedContentBuffer = base64ToArrayBuffer(encryptedContent);
  const ivBuffer = base64ToArrayBuffer(iv);
  const authTagBuffer = base64ToArrayBuffer(authTag);

  let finalDek: ArrayBuffer;

  if (dek) {
    // For regular snippets, use the DEK directly from the URL
    // Convert base64url to standard base64
    const base64Dek = base64urlToBase64(dek);
    finalDek = base64ToArrayBuffer(base64Dek);
  } else if (
    password
    && encryptedDek
    && ivForDek
    && authTagForDek
    && kdfSalt
    && kdfParameters
  ) {
    // For password-protected snippets, derive the KEK and decrypt the DEK
    const encryptedDekBuffer = base64ToArrayBuffer(encryptedDek);
    const ivForDekBuffer = base64ToArrayBuffer(ivForDek);
    const authTagForDekBuffer = base64ToArrayBuffer(authTagForDek);
    const kdfSaltBuffer = base64ToArrayBuffer(kdfSalt);

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
    throw new Error(
      'Failed to decrypt content. The decryption key may be incorrect or the data may be corrupted.',
    );
  }
}
