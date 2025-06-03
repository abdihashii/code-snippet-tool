import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  arrayBufferToBase64,
  exportKeyToUrlSafeBase64,
} from '@/lib/crypto-utils';

// Mock browser APIs for Node.js test environment
const mockBtoa = vi.fn();
const mockCrypto = {
  subtle: {
    exportKey: vi.fn(),
  },
};

beforeEach(() => {
  // Mock window.btoa
  vi.stubGlobal('window', { btoa: mockBtoa });

  // Mock crypto.subtle
  vi.stubGlobal('crypto', mockCrypto);

  // Reset mocks
  mockBtoa.mockReset();
  mockCrypto.subtle.exportKey.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('arrayBufferToBase64', () => {
  it('should convert empty ArrayBuffer to empty base64 string', () => {
    mockBtoa.mockReturnValue('');

    const buffer = new ArrayBuffer(0);
    const result = arrayBufferToBase64(buffer);

    expect(mockBtoa).toHaveBeenCalledWith('');
    expect(result).toBe('');
  });

  it('should convert single byte ArrayBuffer to base64', () => {
    mockBtoa.mockReturnValue('QQ==');

    const buffer = new ArrayBuffer(1);
    const view = new Uint8Array(buffer);
    view[0] = 65; // ASCII 'A'

    const result = arrayBufferToBase64(buffer);

    expect(mockBtoa).toHaveBeenCalledWith('A');
    expect(result).toBe('QQ==');
  });

  it('should convert small ArrayBuffer to base64', () => {
    mockBtoa.mockReturnValue('SGkh');

    const buffer = new ArrayBuffer(3);
    const view = new Uint8Array(buffer);
    view[0] = 72; // 'H'
    view[1] = 105; // 'i'
    view[2] = 33; // '!'

    const result = arrayBufferToBase64(buffer);

    expect(mockBtoa).toHaveBeenCalledWith('Hi!');
    expect(result).toBe('SGkh');
  });

  it('should convert "Hello" text to base64', () => {
    mockBtoa.mockReturnValue('SGVsbG8=');

    const text = 'Hello';
    const buffer = new TextEncoder().encode(text).buffer;

    const result = arrayBufferToBase64(buffer);

    expect(mockBtoa).toHaveBeenCalledWith('Hello');
    expect(result).toBe('SGVsbG8=');
  });

  it('should convert longer text to base64', () => {
    mockBtoa.mockReturnValue('SGVsbG8sIFdvcmxkIQ==');

    const text = 'Hello, World!';
    const buffer = new TextEncoder().encode(text).buffer;

    const result = arrayBufferToBase64(buffer);

    expect(mockBtoa).toHaveBeenCalledWith('Hello, World!');
    expect(result).toBe('SGVsbG8sIFdvcmxkIQ==');
  });

  it('should handle binary data correctly', () => {
    mockBtoa.mockReturnValue('AP+AfwA=');

    const buffer = new ArrayBuffer(4);
    const view = new Uint8Array(buffer);
    view[0] = 0x00;
    view[1] = 0xFF;
    view[2] = 0x80;
    view[3] = 0x7F;

    const result = arrayBufferToBase64(buffer);

    expect(mockBtoa).toHaveBeenCalledWith('\x00\xFF\x80\x7F');
    expect(result).toBe('AP+AfwA=');
  });

  it('should handle large ArrayBuffer', () => {
    mockBtoa.mockReturnValue('mock-large-base64-result');

    const size = 1000;
    const buffer = new ArrayBuffer(size);
    const view = new Uint8Array(buffer);

    // Fill with pattern
    for (let i = 0; i < size; i++) {
      view[i] = i % 256;
    }

    const result = arrayBufferToBase64(buffer);

    expect(mockBtoa).toHaveBeenCalled();
    expect(result).toBe('mock-large-base64-result');
  });

  it('should produce same result as btoa for string conversion', () => {
    const expectedBase64 = 'VGVzdCBzdHJpbmc=';
    mockBtoa.mockReturnValue(expectedBase64);

    const text = 'Test string';
    const buffer = new TextEncoder().encode(text).buffer;

    const result = arrayBufferToBase64(buffer);

    expect(mockBtoa).toHaveBeenCalledWith('Test string');
    expect(result).toBe(expectedBase64);
  });

  it('should handle Unicode characters when encoded as UTF-8', () => {
    const mockBase64 = '5L2g5aW95LiW55WM';
    mockBtoa.mockReturnValue(mockBase64);

    const text = '你好世界';
    const buffer = new TextEncoder().encode(text).buffer;

    const result = arrayBufferToBase64(buffer);

    expect(mockBtoa).toHaveBeenCalled();
    expect(result).toBe(mockBase64);
  });

  it('should handle all byte values (0-255)', () => {
    mockBtoa.mockReturnValue('mock-all-bytes-base64');

    const buffer = new ArrayBuffer(256);
    const view = new Uint8Array(buffer);

    for (let i = 0; i < 256; i++) {
      view[i] = i;
    }

    const result = arrayBufferToBase64(buffer);

    expect(mockBtoa).toHaveBeenCalled();
    expect(result).toBe('mock-all-bytes-base64');
  });
});

describe('exportKeyToUrlSafeBase64', () => {
  it('should export CryptoKey and convert to URL-safe base64', async () => {
    const mockKeyData = new ArrayBuffer(32);
    const view = new Uint8Array(mockKeyData);
    view.fill(65); // Fill with 'A' (ASCII 65)

    mockCrypto.subtle.exportKey.mockResolvedValue(mockKeyData);
    mockBtoa.mockReturnValue('QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUE=');

    const mockKey = { type: 'secret' } as CryptoKey;
    const result = await exportKeyToUrlSafeBase64(mockKey);

    expect(mockCrypto.subtle.exportKey).toHaveBeenCalledWith('raw', mockKey);
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    // Should not contain +, /, or = characters
    expect(result).not.toMatch(/[+/=]/);
    expect(result).toMatch(/^[\w-]*$/);
  });

  it('should replace + with - in base64 output', async () => {
    // Create data that will produce + in base64
    const mockKeyData = new ArrayBuffer(3);
    const view = new Uint8Array(mockKeyData);
    view[0] = 0x3E; // Will produce + in base64
    view[1] = 0xFF;
    view[2] = 0x00;

    mockCrypto.subtle.exportKey.mockResolvedValue(mockKeyData);
    mockBtoa.mockReturnValue('P+8A'); // Contains + that should be replaced

    const mockKey = { type: 'secret' } as CryptoKey;
    const result = await exportKeyToUrlSafeBase64(mockKey);

    expect(result).not.toContain('+');
    expect(result).toContain('-');
  });

  it('should replace / with _ in base64 output', async () => {
    // Create data that will produce / in base64
    const mockKeyData = new ArrayBuffer(3);
    const view = new Uint8Array(mockKeyData);
    view[0] = 0x3F; // Will produce / in base64
    view[1] = 0xFF;
    view[2] = 0x00;

    mockCrypto.subtle.exportKey.mockResolvedValue(mockKeyData);
    mockBtoa.mockReturnValue('P/8A'); // Contains / that should be replaced

    const mockKey = { type: 'secret' } as CryptoKey;
    const result = await exportKeyToUrlSafeBase64(mockKey);

    expect(result).not.toContain('/');
    expect(result).toContain('_');
  });

  it('should remove = padding from base64 output', async () => {
    // Create data that will require padding
    const mockKeyData = new ArrayBuffer(1);
    const view = new Uint8Array(mockKeyData);
    view[0] = 65; // 'A'

    mockCrypto.subtle.exportKey.mockResolvedValue(mockKeyData);
    mockBtoa.mockReturnValue('QQ=='); // Contains padding that should be removed

    const mockKey = { type: 'secret' } as CryptoKey;
    const result = await exportKeyToUrlSafeBase64(mockKey);

    expect(result).not.toContain('=');
    expect(result).toBe('QQ'); // 'QQ==' without padding
  });

  it('should handle empty key data', async () => {
    const mockKeyData = new ArrayBuffer(0);

    mockCrypto.subtle.exportKey.mockResolvedValue(mockKeyData);
    mockBtoa.mockReturnValue('');

    const mockKey = { type: 'secret' } as CryptoKey;
    const result = await exportKeyToUrlSafeBase64(mockKey);

    expect(result).toBe('');
  });

  it('should handle standard 32-byte AES key', async () => {
    const mockKeyData = new ArrayBuffer(32);
    const view = new Uint8Array(mockKeyData);

    // Fill with realistic key data
    for (let i = 0; i < 32; i++) {
      view[i] = (i * 8) % 256;
    }

    mockCrypto.subtle.exportKey.mockResolvedValue(mockKeyData);
    mockBtoa.mockReturnValue('AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8=');

    const mockKey = { type: 'secret' } as CryptoKey;
    const result = await exportKeyToUrlSafeBase64(mockKey);

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    // URL-safe characters only
    expect(result).toMatch(/^[\w-]*$/);
  });

  it('should handle all URL-unsafe characters in conversion', async () => {
    // Create data that produces +, /, and = in base64
    const testData = 'This is a test string that should produce + and / characters in base64?>';
    const mockKeyData = new TextEncoder().encode(testData).buffer;

    mockCrypto.subtle.exportKey.mockResolvedValue(mockKeyData);
    mockBtoa.mockReturnValue('VGhpcyBpcyBhIHRlc3Qgc3RyaW5nIHRoYXQgc2hvdWxkIHByb2R1Y2UgKyBhbmQgLyBjaGFyYWN0ZXJzIGluIGJhc2U2ND8+');

    const mockKey = { type: 'secret' } as CryptoKey;
    const result = await exportKeyToUrlSafeBase64(mockKey);

    // Should not contain any URL-unsafe characters
    expect(result).not.toMatch(/[+/=]/);
    expect(result).toMatch(/^[\w-]*$/);
  });

  it('should be reversible with proper URL-safe to base64 conversion', async () => {
    const originalData = 'Test key data for reversibility check';
    const mockKeyData = new TextEncoder().encode(originalData).buffer;

    mockCrypto.subtle.exportKey.mockResolvedValue(mockKeyData);
    mockBtoa.mockReturnValue('VGVzdCBrZXkgZGF0YSBmb3IgcmV2ZXJzaWJpbGl0eSBjaGVjaw==');

    const mockKey = { type: 'secret' } as CryptoKey;
    const urlSafeResult = await exportKeyToUrlSafeBase64(mockKey);

    // Convert back to standard base64
    const standardBase64 = urlSafeResult
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(urlSafeResult.length + ((4 - (urlSafeResult.length % 4)) % 4), '=');

    expect(standardBase64).toBe('VGVzdCBrZXkgZGF0YSBmb3IgcmV2ZXJzaWJpbGl0eSBjaGVjaw==');
  });

  it('should handle crypto.subtle.exportKey rejection', async () => {
    mockCrypto.subtle.exportKey.mockRejectedValue(new Error('Export failed'));

    const mockKey = { type: 'secret' } as CryptoKey;

    await expect(exportKeyToUrlSafeBase64(mockKey)).rejects.toThrow('Export failed');
  });

  it('should handle large key data', async () => {
    const largeKeyData = new ArrayBuffer(1024);
    const view = new Uint8Array(largeKeyData);

    // Fill with pattern
    for (let i = 0; i < 1024; i++) {
      view[i] = i % 256;
    }

    mockCrypto.subtle.exportKey.mockResolvedValue(largeKeyData);
    mockBtoa.mockReturnValue('mock-large-key-base64-result');

    const mockKey = { type: 'secret' } as CryptoKey;
    const result = await exportKeyToUrlSafeBase64(mockKey);

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatch(/^[\w-]*$/);
  });

  it('should work with realistic usage scenario from snippet creation', async () => {
    // Simulate a 32-byte AES-GCM key that would be used for DEK
    const dekData = new ArrayBuffer(32);
    const view = new Uint8Array(dekData);

    // Fill with crypto-random-like data
    for (let i = 0; i < 32; i++) {
      view[i] = Math.floor(Math.random() * 256);
    }

    mockCrypto.subtle.exportKey.mockResolvedValue(dekData);
    mockBtoa.mockReturnValue('bW9jay1kZWstYmFzZTY0LXJlc3VsdC1mb3ItdXJsLWZyYWdtZW50');

    const mockDek = { type: 'secret' } as CryptoKey;
    const shareableLinkFragment = await exportKeyToUrlSafeBase64(mockDek);

    // Should be suitable for URL fragment
    expect(shareableLinkFragment).toMatch(/^[\w-]*$/);
    expect(shareableLinkFragment.length).toBeGreaterThan(20); // Reasonable length for 32-byte key

    // Should be usable in URL
    const testUrl = `https://example.com/s/snippet-id#${shareableLinkFragment}`;
    expect(() => new URL(testUrl)).not.toThrow();
  });
});
