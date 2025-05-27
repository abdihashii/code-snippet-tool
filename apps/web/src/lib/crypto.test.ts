import { describe, expect, it, vi } from 'vitest';

import {
  decryptSnippet,
} from './crypto';

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
  });
});
