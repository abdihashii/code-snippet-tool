import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';

/**
 * Generates a unique, cryptographically secure Initialization Vector (IV).
 * For AES-GCM, a 12-byte (96-bit) IV is commonly recommended for performance
 * and security.
 *
 * If you encounter type errors for `Buffer` or `crypto` module elements,
 * ensure you have Node.js type definitions installed in your project:
 * `pnpm add --save-dev @types/node`
 *
 * @returns {Buffer} A Buffer containing the generated IV.
 * @throws {Error} If there is an error during random byte generation.
 */
export function generateInitializationVector(): Buffer {
  // AES-GCM typically uses a 12-byte (96-bit) IV.
  // Using a different length might be suitable for other algorithms/modes,
  // but 12 bytes is a strong default for GCM.
  const ivLengthBytes = 12;

  try {
    // crypto.randomBytes is suitable for generating cryptographically strong
    // pseudo-random data.
    const iv = crypto.randomBytes(ivLengthBytes);
    return iv;
  } catch (error) {
    // In the unlikely event that randomBytes() fails, we throw an error.
    console.error('Error generating initialization vector:', error);
    throw new Error('Failed to generate a cryptographically secure IV.');
  }
}

/**
 * Retrieves the AES-256 encryption key.
 *
 * !!! WARNING: THIS IS A PLACEHOLDER AND NOT SECURE FOR PRODUCTION !!!
 * In a production environment, this function MUST be replaced with a secure mechanism
 * to retrieve the encryption key from a Key Management Service (KMS) like
 * AWS KMS, Azure Key Vault, Google Cloud KMS, or HashiCorp Vault.
 * Keys should never be hardcoded or insecurely stored in environment variables
 * for production workloads.
 *
 * For this example, it attempts to read the key from an environment variable
 * `ENCRYPTION_KEY_HEX` (expected to be a 64-character hex string for a 256-bit key).
 *
 * @param {string} keyHex The encryption key as a 64-character hex string.
 * @returns {Buffer} The encryption key as a Buffer (32 bytes).
 * @throws {Error} If the key is not found via the environment variable or is invalid.
 */
export function getEncryptionKey(keyHex: string): Buffer {
  if (!keyHex) {
    throw new Error(
      'Encryption key not provided. '
      + 'This is required for the example. In a production system, '
      + 'this function must securely fetch the key from a Key Management Service.',
    );
  }

  // A 256-bit key is 32 bytes, which is 64 hexadecimal characters.
  if (keyHex.length !== 64) {
    throw new Error(
      'Invalid encryption key length. Expected 64 hex characters for a 256-bit key.',
    );
  }

  try {
    const key = Buffer.from(keyHex, 'hex');
    if (key.length !== 32) {
      // This check is a bit redundant if hex length is 64, but good for sanity.
      throw new Error('Derived key is not 32 bytes long. Check your encryption key.');
    }
    return key;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse encryption key as a hex string: ${message}`);
  }
}

/**
 * Interface for the output of the encryption function.
 */
export interface EncryptedTextOutput {
  ciphertext: Buffer; // The encrypted data
  auth_tag: Buffer; // The GCM authentication tag
  initialization_vector: Buffer; // The IV that was used for this encryption
}

/**
 * Encrypts plaintext content using AES-256-GCM.
 *
 * @param {string} plaintext The text content to encrypt.
 * @param {Buffer} key The 32-byte (256-bit) encryption key.
 * @param {Buffer} initialization_vector The 12-byte (96-bit) Initialization Vector.
 * It's crucial that this IV is unique for every encryption operation
 * performed with the same key.
 * @returns {EncryptedTextOutput} An object containing the ciphertext, auth_tag,
 * and the initialization_vector used.
 * @throws {Error} If encryption fails or inputs are invalid.
 */
export function encryptText(
  plaintext: string,
  key: Buffer,
  initialization_vector: Buffer,
): EncryptedTextOutput {
  // Validate key length
  if (key.length !== 32) {
    throw new Error(
      'Invalid key length. Key must be 32 bytes (256 bits) for AES-256-GCM.',
    );
  }

  // Validate IV length
  if (initialization_vector.length !== 12) {
    throw new Error(
      'Invalid IV length. IV must be 12 bytes (96 bits) for AES-256-GCM with common usage.',
    );
  }

  try {
    // Create a cipher instance with AES-256-GCM algorithm, key, and IV
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      key,
      initialization_vector,
    );

    // Update the cipher with the plaintext (encoded as UTF-8)
    // The `update` method can be called multiple times with chunks of data
    let encrypted = cipher.update(plaintext, 'utf-8');

    // Finalize the encryption - this processes any remaining data
    // For GCM, cipher.final() typically returns an empty buffer if all data
    // was passed to update.
    // It's good practice to concatenate, though for GCM with single update,
    // final might be empty.
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Get the authentication tag. This tag is essential for GCM mode as it
    // provides authenticity and integrity of the encrypted data. It must be
    // stored and used during decryption.
    const auth_tag = cipher.getAuthTag(); // Typically 16 bytes for AES-GCM

    return {
      ciphertext: encrypted,
      auth_tag,
      initialization_vector, // Returning the IV used, for convenience
    };
  } catch (error) {
    console.error('Encryption failed:', error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Encryption process failed: ${message}`);
  }
}

/**
 * Decrypts ciphertext using AES-256-GCM.
 *
 * @param {Buffer} ciphertext The encrypted data.
 * @param {Buffer} key The 32-byte (256-bit) encryption key.
 * @param {Buffer} initialization_vector The 12-byte (96-bit) Initialization Vector used for encryption.
 * @param {Buffer} auth_tag The GCM authentication tag generated during encryption.
 * @returns {string} The decrypted plaintext.
 * @throws {Error} If decryption fails (e.g., auth tag mismatch, invalid inputs).
 */
export function decryptText(
  ciphertext: Buffer,
  key: Buffer,
  initialization_vector: Buffer,
  auth_tag: Buffer,
): string {
  // Validate key length
  if (key.length !== 32) {
    throw new Error(
      'Invalid key length. Key must be 32 bytes (256 bits) for AES-256-GCM.',
    );
  }

  // Validate IV length
  if (initialization_vector.length !== 12) {
    throw new Error(
      'Invalid IV length. IV must be 12 bytes (96 bits) for AES-256-GCM with common usage.',
    );
  }

  // Validate auth tag length (typically 16 bytes for AES-GCM)
  if (auth_tag.length !== 16) {
    // Note: AES-GCM supports other tag lengths, but 16 bytes (128 bits) is common.
    // If you use other tag lengths, adjust this check accordingly.
    throw new Error(
      'Invalid auth tag length. Expected 16 bytes (128 bits) for common AES-256-GCM usage.',
    );
  }

  try {
    // Decipher the ciphertext using the same algorithm and key
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      key,
      initialization_vector,
    );

    // Set the authentication tag. This is crucial for GCM.
    // If the tag does not match, decipher.final() will throw an error.
    decipher.setAuthTag(auth_tag);

    // Update with the ciphertext and finalize
    let decrypted = decipher.update(ciphertext);
    decrypted = Buffer.concat([decrypted, decipher.final()]); // final() throws on auth failure

    // Return the decrypted text as a UTF-8 string
    return decrypted.toString('utf-8');
  } catch (error) {
    console.error('Decryption failed:', error);
    // Do not provide overly specific error messages to the client in case of
    // auth failure, as it might leak sensitive information. A generic
    // "Decryption failed" or "Invalid data" is often better.
    // The console log above is for server-side debugging.
    const message = error instanceof Error ? error.message : String(error);
    // Check for common GCM authentication failure messages
    if (
      message.toLowerCase().includes('unsupported state')
      || message.toLowerCase().includes('authentication tag mismatch')
      || message.toLowerCase().includes('bad decrypt') // Node.js versions might vary error message
    ) {
      throw new Error(
        'Decryption failed: Authentication tag mismatch or invalid/corrupted data.',
      );
    }
    throw new Error(`Decryption process failed: ${message}`);
  }
}
