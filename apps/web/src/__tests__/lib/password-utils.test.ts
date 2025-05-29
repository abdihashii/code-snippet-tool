import { describe, expect, it, vi } from 'vitest';

import { generateStrongPassword } from '@/lib/password-utils';

// Mock crypto.getRandomValues for consistent testing
const mockGetRandomValues = vi.fn();
Object.defineProperty(globalThis, 'crypto', {
  value: {
    getRandomValues: mockGetRandomValues,
  },
  writable: true,
});

describe('password-utils', () => {
  describe('generateStrongPassword', () => {
    it('should generate a password with exactly 16 characters', () => {
      // Mock random values to return predictable results
      mockGetRandomValues.mockImplementation((array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = i; // Sequential values for predictability
        }
        return array;
      });

      const password = generateStrongPassword();
      expect(password).toHaveLength(16);
    });

    it('should include at least one lowercase letter', () => {
      mockGetRandomValues.mockImplementation((array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = i;
        }
        return array;
      });

      const password = generateStrongPassword();
      expect(password).toMatch(/[a-z]/);
    });

    it('should include at least one uppercase letter', () => {
      mockGetRandomValues.mockImplementation((array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = i;
        }
        return array;
      });

      const password = generateStrongPassword();
      expect(password).toMatch(/[A-Z]/);
    });

    it('should include at least one number', () => {
      mockGetRandomValues.mockImplementation((array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = i;
        }
        return array;
      });

      const password = generateStrongPassword();
      expect(password).toMatch(/\d/);
    });

    it('should include at least one symbol', () => {
      mockGetRandomValues.mockImplementation((array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = i;
        }
        return array;
      });

      const password = generateStrongPassword();
      expect(password).toMatch(/[!@#$%^&*(),.?":{}|<>=_-]/);
    });

    it('should generate different passwords on subsequent calls', () => {
      // Mock to return different values for each call
      let callCount = 0;
      mockGetRandomValues.mockImplementation((array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = (i + callCount * 1000) % 4294967296;
        }
        callCount++;
        return array;
      });

      const password1 = generateStrongPassword();
      const password2 = generateStrongPassword();

      expect(password1).not.toBe(password2);
    });

    it('should only contain valid characters', () => {
      mockGetRandomValues.mockImplementation((array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = i;
        }
        return array;
      });

      const password = generateStrongPassword();
      const validChars = /^[\w!@#$%^&*(),.?":{}|<>=-]+$/;
      expect(password).toMatch(validChars);
    });

    it('should handle edge case where getRandomValues returns maximum values', () => {
      mockGetRandomValues.mockImplementation((array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = 4294967295; // Maximum uint32 value
        }
        return array;
      });

      const password = generateStrongPassword();
      expect(password).toHaveLength(16);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/\d/);
      expect(password).toMatch(/[!@#$%^&*(),.?":{}|<>=_-]/);
    });

    it('should handle edge case where getRandomValues returns zero values', () => {
      mockGetRandomValues.mockImplementation((array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = 0;
        }
        return array;
      });

      const password = generateStrongPassword();
      expect(password).toHaveLength(16);
      // Even with all zeros, the first 4 characters will still be from each required set
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/\d/);
      expect(password).toMatch(/[!@#$%^&*(),.?":{}|<>=_-]/);
    });

    it('should create a shuffled password (not predictable pattern)', () => {
      // Mock to return sequential values
      mockGetRandomValues.mockImplementation((array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = i;
        }
        return array;
      });

      const password = generateStrongPassword();

      // The password should not start with the first character of each character set
      // in order (which would indicate no shuffling)
      const expectedUnshuffled = `aA0!${'n'.repeat(12)}`;
      expect(password).not.toBe(expectedUnshuffled);
    });

    it('should work with real crypto.getRandomValues', () => {
      // Restore real crypto for this test
      mockGetRandomValues.mockRestore();

      const password = generateStrongPassword();

      expect(password).toHaveLength(16);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/\d/);
      expect(password).toMatch(/[!@#$%^&*(),.?":{}|<>=_-]/);

      // Re-mock for other tests
      mockGetRandomValues.mockImplementation((array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = i;
        }
        return array;
      });
    });

    it('should generate multiple valid passwords in succession', () => {
      let callCount = 0;
      mockGetRandomValues.mockImplementation((array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = (i + callCount * 17) % 4294967296; // Different seed for each call
        }
        callCount++;
        return array;
      });

      const passwords = [];
      for (let i = 0; i < 10; i++) {
        const password = generateStrongPassword();
        passwords.push(password);

        expect(password).toHaveLength(16);
        expect(password).toMatch(/[a-z]/);
        expect(password).toMatch(/[A-Z]/);
        expect(password).toMatch(/\d/);
        expect(password).toMatch(/[!@#$%^&*(),.?":{}|<>=_-]/);
      }

      // All passwords should be unique
      const uniquePasswords = new Set(passwords);
      expect(uniquePasswords.size).toBe(10);
    });
  });
});
