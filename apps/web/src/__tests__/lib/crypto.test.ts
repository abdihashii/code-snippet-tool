import { describe, expect, it, vi } from 'vitest';

import {
  decryptSnippet,
} from '@/lib/crypto';

// Mock the Web Crypto API
const mockCrypto = {
  subtle: {
    importKey: vi.fn(),
    decrypt: vi.fn(),
    deriveBits: vi.fn(),
  },
};

// Replace global crypto with mock
vi.stubGlobal('crypto', mockCrypto);

describe('crypto', () => {
  describe('decryptSnippet', () => {
    describe('regular snippets (with DEK)', () => {
      it('should decrypt content with valid DEK from URL', async () => {
        // Mock successful decryption
        const mockKey = { type: 'secret' };
        const decryptedData = new TextEncoder().encode('Hello, World!');

        mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
        mockCrypto.subtle.decrypt.mockResolvedValue(decryptedData.buffer);

        const result = await decryptSnippet({
          encryptedContent: 'SGVsbG8=', // Base64 encoded
          iv: 'AAAAAAAAAAAAAAAAAAAAAA==', // Base64 encoded 16 bytes
          authTag: 'AAAAAAAAAAAAAAAAAAAAAA==', // Base64 encoded 16 bytes
          dek: 'test-dek-base64url', // Base64url encoded
        });

        expect(result).toBe('Hello, World!');
        expect(mockCrypto.subtle.importKey).toHaveBeenCalledWith(
          'raw',
          expect.any(ArrayBuffer),
          { name: 'AES-GCM' },
          false,
          ['decrypt'],
        );
      });

      it('should handle base64url to base64 conversion correctly', async () => {
        const mockKey = { type: 'secret' };
        const decryptedData = new TextEncoder().encode('Test content');

        mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
        mockCrypto.subtle.decrypt.mockResolvedValue(decryptedData.buffer);

        // Test with base64url that needs padding
        const result = await decryptSnippet({
          encryptedContent: 'VGVzdA==',
          iv: 'AAAAAAAAAAAAAAAAAAAAAA==',
          authTag: 'AAAAAAAAAAAAAAAAAAAAAA==',
          dek: 'abc-def_ghi', // Base64url with - and _
        });

        expect(result).toBe('Test content');
      });

      it('should throw error when decryption fails', async () => {
        mockCrypto.subtle.importKey.mockResolvedValue({ type: 'secret' });
        mockCrypto.subtle.decrypt.mockRejectedValue(new Error('Decryption failed'));

        await expect(
          decryptSnippet({
            encryptedContent: 'SGVsbG8=',
            iv: 'AAAAAAAAAAAAAAAAAAAAAA==',
            authTag: 'AAAAAAAAAAAAAAAAAAAAAA==',
            dek: 'invalid-dek',
          }),
        ).rejects.toThrow('Failed to decrypt content');
      });
    });

    describe('password-protected snippets', () => {
      it('should decrypt content with valid password', async () => {
        const mockKek = { type: 'secret' };
        const mockDekKey = { type: 'secret' };
        const decryptedDek = new Uint8Array(32).buffer; // 32 bytes for AES-256
        const decryptedContent = new TextEncoder().encode('Secret content');

        // Mock password key import
        mockCrypto.subtle.importKey
          .mockResolvedValueOnce({ type: 'password' }) // For PBKDF2
          .mockResolvedValueOnce(mockKek) // For KEK
          .mockResolvedValueOnce(mockDekKey); // For DEK

        // Mock PBKDF2 derivation
        mockCrypto.subtle.deriveBits.mockResolvedValue(new ArrayBuffer(32));

        // Mock DEK decryption
        mockCrypto.subtle.decrypt
          .mockResolvedValueOnce(decryptedDek) // Decrypt DEK
          .mockResolvedValueOnce(decryptedContent.buffer); // Decrypt content

        const result = await decryptSnippet({
          encryptedContent: 'U2VjcmV0',
          iv: 'AAAAAAAAAAAAAAAAAAAAAA==',
          authTag: 'AAAAAAAAAAAAAAAAAAAAAA==',
          encryptedDek: 'BBBBBBBBBBBBBBBBBBBBBB==',
          ivForDek: 'CCCCCCCCCCCCCCCCCCCCCC==',
          authTagForDek: 'DDDDDDDDDDDDDDDDDDDDDD==',
          kdfSalt: 'EEEEEEEEEEEEEEEEEEEEEE==',
          kdfParameters: {
            iterations: 100000,
            hash: 'SHA-256',
          },
          password: 'test-password',
        });

        expect(result).toBe('Secret content');
        expect(mockCrypto.subtle.deriveBits).toHaveBeenCalledWith(
          {
            name: 'PBKDF2',
            salt: expect.any(ArrayBuffer),
            iterations: 100000,
            hash: 'SHA-256',
          },
          expect.any(Object),
          256,
        );
      });

      it('should throw error with incorrect password', async () => {
        mockCrypto.subtle.importKey
          .mockResolvedValueOnce({ type: 'password' })
          .mockResolvedValueOnce({ type: 'secret' });

        mockCrypto.subtle.deriveBits.mockResolvedValue(new ArrayBuffer(32));
        mockCrypto.subtle.decrypt.mockRejectedValue(new Error('Invalid auth tag'));

        await expect(
          decryptSnippet({
            encryptedContent: 'U2VjcmV0',
            iv: 'AAAAAAAAAAAAAAAAAAAAAA==',
            authTag: 'AAAAAAAAAAAAAAAAAAAAAA==',
            encryptedDek: 'BBBBBBBBBBBBBBBBBBBBBB==',
            ivForDek: 'CCCCCCCCCCCCCCCCCCCCCC==',
            authTagForDek: 'DDDDDDDDDDDDDDDDDDDDDD==',
            kdfSalt: 'EEEEEEEEEEEEEEEEEEEEEE==',
            kdfParameters: {
              iterations: 100000,
              hash: 'SHA-256',
            },
            password: 'wrong-password',
          }),
        ).rejects.toThrow();
      });
    });

    describe('parameter validation', () => {
      it('should throw error when neither dek nor password parameters are provided', async () => {
        await expect(
          decryptSnippet({
            encryptedContent: 'SGVsbG8=',
            iv: 'AAAAAAAAAAAAAAAAAAAAAA==',
            authTag: 'AAAAAAAAAAAAAAAAAAAAAA==',
          }),
        ).rejects.toThrow('Invalid decryption parameters');
      });

      it('should throw error when password is provided but other required params are missing', async () => {
        await expect(
          decryptSnippet({
            encryptedContent: 'SGVsbG8=',
            iv: 'AAAAAAAAAAAAAAAAAAAAAA==',
            authTag: 'AAAAAAAAAAAAAAAAAAAAAA==',
            password: 'test-password',
            // Missing: encryptedDek, ivForDek, authTagForDek, kdfSalt, kdfParameters
          }),
        ).rejects.toThrow('Invalid decryption parameters');
      });

      it('should throw error when some password-protected params are missing', async () => {
        await expect(
          decryptSnippet({
            encryptedContent: 'SGVsbG8=',
            iv: 'AAAAAAAAAAAAAAAAAAAAAA==',
            authTag: 'AAAAAAAAAAAAAAAAAAAAAA==',
            password: 'test-password',
            encryptedDek: 'BBBBBBBBBBBBBBBBBBBBBB==',
            // Missing other required params
          }),
        ).rejects.toThrow('Invalid decryption parameters');
      });
    });

    describe('base64 decoding', () => {
      it('should handle various base64 encoded inputs', async () => {
        const mockKey = { type: 'secret' };
        const decryptedData = new TextEncoder().encode('Test');

        mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
        mockCrypto.subtle.decrypt.mockResolvedValue(decryptedData.buffer);

        // Test with different base64 strings
        const testCases = [
          { encoded: 'SGVsbG8=', description: 'with padding' },
          { encoded: 'SGVsbG8', description: 'without padding' },
          { encoded: 'U29tZUxvbmdlclRleHQ=', description: 'longer text' },
        ];

        for (const testCase of testCases) {
          mockCrypto.subtle.importKey.mockClear();
          mockCrypto.subtle.decrypt.mockClear();

          mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
          mockCrypto.subtle.decrypt.mockResolvedValue(decryptedData.buffer);

          const result = await decryptSnippet({
            encryptedContent: testCase.encoded,
            iv: 'AAAAAAAAAAAAAAAAAAAAAA==',
            authTag: 'AAAAAAAAAAAAAAAAAAAAAA==',
            dek: 'test-dek',
          });

          expect(result).toBe('Test');
        }
      });

      it('should throw error for invalid base64', async () => {
        await expect(
          decryptSnippet({
            encryptedContent: 'Invalid!@#$%Base64',
            iv: 'AAAAAAAAAAAAAAAAAAAAAA==',
            authTag: 'AAAAAAAAAAAAAAAAAAAAAA==',
            dek: 'test-dek',
          }),
        ).rejects.toThrow();
      });
    });

    describe('error handling', () => {
      it('should provide meaningful error message when content decryption fails', async () => {
        mockCrypto.subtle.importKey.mockResolvedValue({ type: 'secret' });
        mockCrypto.subtle.decrypt.mockRejectedValue(new Error('Invalid authentication tag'));

        await expect(
          decryptSnippet({
            encryptedContent: 'SGVsbG8=',
            iv: 'AAAAAAAAAAAAAAAAAAAAAA==',
            authTag: 'AAAAAAAAAAAAAAAAAAAAAA==',
            dek: 'test-dek',
          }),
        ).rejects.toThrow('Failed to decrypt content. The decryption key may be incorrect or the data may be corrupted.');
      });

      it('should handle Web Crypto API not available', async () => {
        const originalCrypto = globalThis.crypto;
        // @ts-expect-error - Temporarily remove crypto
        globalThis.crypto = undefined;

        await expect(
          decryptSnippet({
            encryptedContent: 'SGVsbG8=',
            iv: 'AAAAAAAAAAAAAAAAAAAAAA==',
            authTag: 'AAAAAAAAAAAAAAAAAAAAAA==',
            dek: 'test-dek',
          }),
        ).rejects.toThrow();

        globalThis.crypto = originalCrypto;
      });
    });

    describe('integration scenarios', () => {
      it('should handle real-world base64url DEK from URL fragment', async () => {
        const mockKey = { type: 'secret' };
        const decryptedData = new TextEncoder().encode('Sensitive data');

        mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
        mockCrypto.subtle.decrypt.mockResolvedValue(decryptedData.buffer);

        // Simulate a real DEK that might come from URL fragment
        const urlSafeDek = 'VGhpc0lzQVRlc3RLZXlGb3JBZXM_'; // Missing padding, has - and _

        const result = await decryptSnippet({
          encryptedContent: 'U2Vuc2l0aXZl',
          iv: 'AAAAAAAAAAAAAAAAAAAAAA==',
          authTag: 'AAAAAAAAAAAAAAAAAAAAAA==',
          dek: urlSafeDek,
        });

        expect(result).toBe('Sensitive data');
      });

      it('should handle large encrypted content', async () => {
        const mockKey = { type: 'secret' };
        const largeContent = 'A'.repeat(10000);
        const decryptedData = new TextEncoder().encode(largeContent);

        mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
        mockCrypto.subtle.decrypt.mockResolvedValue(decryptedData.buffer);

        // Create a large base64 string
        const largeBase64 = btoa('X'.repeat(7500)); // Will be ~10000 chars when encoded

        const result = await decryptSnippet({
          encryptedContent: largeBase64,
          iv: 'AAAAAAAAAAAAAAAAAAAAAA==',
          authTag: 'AAAAAAAAAAAAAAAAAAAAAA==',
          dek: 'test-dek',
        });

        expect(result).toBe(largeContent);
      });
    });

    describe('real-world usage from $snippet-id.tsx', () => {
      it('should handle field name mapping from API response', async () => {
        const mockKey = { type: 'secret' };
        const decryptedData = new TextEncoder().encode('API response content');

        mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
        mockCrypto.subtle.decrypt.mockResolvedValue(decryptedData.buffer);

        // Test with field names as they come from the API
        const result = await decryptSnippet({
          encryptedContent: 'QVBJIHJlc3BvbnNl',
          iv: 'AAAAAAAAAAAAAAAAAAAAAA==', // maps from initialization_vector
          authTag: 'AAAAAAAAAAAAAAAAAAAAAA==', // maps from auth_tag
          dek: 'test-dek-from-url-hash',
        });

        expect(result).toBe('API response content');
      });

      it('should handle password-protected snippet with API field names', async () => {
        const mockKek = { type: 'secret' };
        const mockDekKey = { type: 'secret' };
        const decryptedDek = new Uint8Array(32).buffer;
        const decryptedContent = new TextEncoder().encode('Password protected content');

        mockCrypto.subtle.importKey
          .mockResolvedValueOnce({ type: 'password' })
          .mockResolvedValueOnce(mockKek)
          .mockResolvedValueOnce(mockDekKey);

        mockCrypto.subtle.deriveBits.mockResolvedValue(new ArrayBuffer(32));

        mockCrypto.subtle.decrypt
          .mockResolvedValueOnce(decryptedDek)
          .mockResolvedValueOnce(decryptedContent.buffer);

        // Test with field names as they come from the API
        const result = await decryptSnippet({
          encryptedContent: 'UGFzc3dvcmQ=',
          iv: 'AAAAAAAAAAAAAAAAAAAAAA==', // maps from initialization_vector
          authTag: 'AAAAAAAAAAAAAAAAAAAAAA==', // maps from auth_tag
          encryptedDek: 'BBBBBBBBBBBBBBBBBBBBBB==', // maps from encrypted_dek
          ivForDek: 'CCCCCCCCCCCCCCCCCCCCCC==', // maps from iv_for_dek
          authTagForDek: 'DDDDDDDDDDDDDDDDDDDDDD==', // maps from auth_tag_for_dek
          kdfSalt: 'EEEEEEEEEEEEEEEEEEEEEE==', // maps from kdf_salt
          kdfParameters: { // maps from kdf_parameters
            iterations: 100000,
            hash: 'SHA-256',
          },
          password: 'user-password',
        });

        expect(result).toBe('Password protected content');
      });

      it('should handle empty DEK from URL hash', async () => {
        // This simulates the case where window.location.hash.substring(1) returns empty string
        await expect(
          decryptSnippet({
            encryptedContent: 'SGVsbG8=',
            iv: 'AAAAAAAAAAAAAAAAAAAAAA==',
            authTag: 'AAAAAAAAAAAAAAAAAAAAAA==',
            dek: '', // Empty DEK from URL
          }),
        ).rejects.toThrow();
      });

      it('should handle decryption with special characters in content', async () => {
        const mockKey = { type: 'secret' };
        const specialContent = '{"code": "console.log(\'Hello, World!\');", "emoji": "🚀"}';
        const decryptedData = new TextEncoder().encode(specialContent);

        mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
        mockCrypto.subtle.decrypt.mockResolvedValue(decryptedData.buffer);

        const result = await decryptSnippet({
          encryptedContent: 'eyJjb2RlIjogImNvbnNvbGU=',
          iv: 'AAAAAAAAAAAAAAAAAAAAAA==',
          authTag: 'AAAAAAAAAAAAAAAAAAAAAA==',
          dek: 'test-dek',
        });

        expect(result).toBe(specialContent);
      });

      it('should handle multi-line code snippets', async () => {
        const mockKey = { type: 'secret' };
        const multilineCode = `function hello() {
  console.log('Hello');
  return 'World';
}`;
        const decryptedData = new TextEncoder().encode(multilineCode);

        mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
        mockCrypto.subtle.decrypt.mockResolvedValue(decryptedData.buffer);

        const result = await decryptSnippet({
          encryptedContent: 'ZnVuY3Rpb24gaGVsbG8=',
          iv: 'AAAAAAAAAAAAAAAAAAAAAA==',
          authTag: 'AAAAAAAAAAAAAAAAAAAAAA==',
          dek: 'test-dek',
        });

        expect(result).toBe(multilineCode);
      });
    });

    describe('edge cases and error scenarios', () => {
      it('should handle malformed base64 in various fields', async () => {
        const testCases = [
          {
            name: 'malformed encrypted content',
            params: {
              encryptedContent: '!!!invalid-base64!!!',
              iv: 'AAAAAAAAAAAAAAAAAAAAAA==',
              authTag: 'AAAAAAAAAAAAAAAAAAAAAA==',
              dek: 'test-dek',
            },
          },
          {
            name: 'malformed IV',
            params: {
              encryptedContent: 'SGVsbG8=',
              iv: '!!!invalid-base64!!!',
              authTag: 'AAAAAAAAAAAAAAAAAAAAAA==',
              dek: 'test-dek',
            },
          },
          {
            name: 'malformed auth tag',
            params: {
              encryptedContent: 'SGVsbG8=',
              iv: 'AAAAAAAAAAAAAAAAAAAAAA==',
              authTag: '!!!invalid-base64!!!',
              dek: 'test-dek',
            },
          },
        ];

        for (const testCase of testCases) {
          await expect(
            decryptSnippet(testCase.params),
          ).rejects.toThrow();
        }
      });

      it('should handle decryption failure for password-protected snippet at DEK stage', async () => {
        mockCrypto.subtle.importKey
          .mockResolvedValueOnce({ type: 'password' })
          .mockResolvedValueOnce({ type: 'secret' });

        mockCrypto.subtle.deriveBits.mockResolvedValue(new ArrayBuffer(32));

        // Fail at DEK decryption stage
        mockCrypto.subtle.decrypt.mockRejectedValueOnce(new Error('Failed to decrypt DEK'));

        await expect(
          decryptSnippet({
            encryptedContent: 'U2VjcmV0',
            iv: 'AAAAAAAAAAAAAAAAAAAAAA==',
            authTag: 'AAAAAAAAAAAAAAAAAAAAAA==',
            encryptedDek: 'BBBBBBBBBBBBBBBBBBBBBB==',
            ivForDek: 'CCCCCCCCCCCCCCCCCCCCCC==',
            authTagForDek: 'DDDDDDDDDDDDDDDDDDDDDD==',
            kdfSalt: 'EEEEEEEEEEEEEEEEEEEEEE==',
            kdfParameters: {
              iterations: 100000,
              hash: 'SHA-256',
            },
            password: 'test-password',
          }),
        ).rejects.toThrow();
      });

      it('should handle decryption failure for password-protected snippet at content stage', async () => {
        const mockKek = { type: 'secret' };
        const mockDekKey = { type: 'secret' };
        const decryptedDek = new Uint8Array(32).buffer;

        mockCrypto.subtle.importKey
          .mockResolvedValueOnce({ type: 'password' })
          .mockResolvedValueOnce(mockKek)
          .mockResolvedValueOnce(mockDekKey);

        mockCrypto.subtle.deriveBits.mockResolvedValue(new ArrayBuffer(32));

        mockCrypto.subtle.decrypt
          .mockResolvedValueOnce(decryptedDek) // DEK decryption succeeds
          .mockRejectedValueOnce(new Error('Failed to decrypt content')); // Content decryption fails

        await expect(
          decryptSnippet({
            encryptedContent: 'U2VjcmV0',
            iv: 'AAAAAAAAAAAAAAAAAAAAAA==',
            authTag: 'AAAAAAAAAAAAAAAAAAAAAA==',
            encryptedDek: 'BBBBBBBBBBBBBBBBBBBBBB==',
            ivForDek: 'CCCCCCCCCCCCCCCCCCCCCC==',
            authTagForDek: 'DDDDDDDDDDDDDDDDDDDDDD==',
            kdfSalt: 'EEEEEEEEEEEEEEEEEEEEEE==',
            kdfParameters: {
              iterations: 100000,
              hash: 'SHA-256',
            },
            password: 'test-password',
          }),
        ).rejects.toThrow('Failed to decrypt content');
      });

      it('should handle very short DEK', async () => {
        await expect(
          decryptSnippet({
            encryptedContent: 'SGVsbG8=',
            iv: 'AAAAAAAAAAAAAAAAAAAAAA==',
            authTag: 'AAAAAAAAAAAAAAAAAAAAAA==',
            dek: 'a', // Very short DEK
          }),
        ).rejects.toThrow();
      });

      it('should handle Unicode content correctly', async () => {
        const mockKey = { type: 'secret' };
        const unicodeContent = '你好世界 🌍 Здравствуй мир';
        const decryptedData = new TextEncoder().encode(unicodeContent);

        mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
        mockCrypto.subtle.decrypt.mockResolvedValue(decryptedData.buffer);

        const result = await decryptSnippet({
          encryptedContent: '5L2g5aW95LiW55WM',
          iv: 'AAAAAAAAAAAAAAAAAAAAAA==',
          authTag: 'AAAAAAAAAAAAAAAAAAAAAA==',
          dek: 'test-dek',
        });

        expect(result).toBe(unicodeContent);
      });
    });
  });
});
