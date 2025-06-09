import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getThemeFromCookieValue, validateTheme } from '@/lib/theme';

describe('theme functions', () => {
  describe('getThemeFromCookieValue', () => {
    it('should return "light" when no cookie exists', () => {
      const result = getThemeFromCookieValue(undefined);
      expect(result).toBe('light');
    });

    it('should return "light" when cookie is null', () => {
      const result = getThemeFromCookieValue(null);
      expect(result).toBe('light');
    });

    it('should return "light" when cookie is empty string', () => {
      const result = getThemeFromCookieValue('');
      expect(result).toBe('light');
    });

    it('should return "dark" when cookie value is "dark"', () => {
      const result = getThemeFromCookieValue('dark');
      expect(result).toBe('dark');
    });

    it('should return "light" when cookie value is "light"', () => {
      const result = getThemeFromCookieValue('light');
      expect(result).toBe('light');
    });

    it('should return invalid cookie value as-is (type coercion)', () => {
      const result = getThemeFromCookieValue('invalid-theme');
      expect(result).toBe('invalid-theme');
    });
  });

  describe('validateTheme', () => {
    describe('valid inputs', () => {
      it('should accept "dark" theme', () => {
        const result = validateTheme('dark');
        expect(result).toBe('dark');
      });

      it('should accept "light" theme', () => {
        const result = validateTheme('light');
        expect(result).toBe('light');
      });
    });

    describe('invalid inputs', () => {
      it('should throw error for non-string input', () => {
        expect(() => validateTheme(123)).toThrow('Invalid theme provided');
      });

      it('should throw error for null input', () => {
        expect(() => validateTheme(null)).toThrow('Invalid theme provided');
      });

      it('should throw error for undefined input', () => {
        expect(() => validateTheme(undefined)).toThrow('Invalid theme provided');
      });

      it('should throw error for empty string', () => {
        expect(() => validateTheme('')).toThrow('Invalid theme provided');
      });

      it('should throw error for object input', () => {
        expect(() => validateTheme({})).toThrow('Invalid theme provided');
      });

      it('should throw error for array input', () => {
        expect(() => validateTheme([])).toThrow('Invalid theme provided');
      });

      it('should throw error for boolean input', () => {
        expect(() => validateTheme(true)).toThrow('Invalid theme provided');
      });

      it('should throw error for invalid theme string', () => {
        expect(() => validateTheme('auto')).toThrow('Invalid theme provided');
      });

      it('should throw error for theme with wrong case', () => {
        expect(() => validateTheme('Dark')).toThrow('Invalid theme provided');
      });

      it('should throw error for theme with extra characters', () => {
        expect(() => validateTheme('dark-mode')).toThrow('Invalid theme provided');
      });
    });
  });

  describe('integration scenarios', () => {
    it('should validate and process theme correctly', () => {
      const validTheme = 'dark';
      const validatedTheme = validateTheme(validTheme);

      expect(validatedTheme).toBe('dark');

      // Test the cookie value processing
      const processedTheme = getThemeFromCookieValue(validatedTheme);
      expect(processedTheme).toBe('dark');
    });

    it('should throw during validation before reaching handler', () => {
      expect(() => {
        validateTheme('invalid');
      }).toThrow('Invalid theme provided');
    });

    it('should handle full theme switching workflow', () => {
      // Get current theme (none exists)
      const currentTheme = getThemeFromCookieValue(undefined);
      expect(currentTheme).toBe('light');

      // Validate and set new theme
      const newTheme = 'dark';
      const validatedTheme = validateTheme(newTheme);
      expect(validatedTheme).toBe('dark');

      // Verify retrieval of new theme
      const updatedTheme = getThemeFromCookieValue('dark');
      expect(updatedTheme).toBe('dark');
    });

    it('should handle edge case with falsy cookie values', () => {
      // Test various falsy values
      const falsyValues = [null, undefined, '', 0, false, Number.NaN];

      falsyValues.forEach((value) => {
        const result = getThemeFromCookieValue(value as any);
        expect(result).toBe('light');
      });
    });

    it('should maintain type safety in validation', () => {
      // These should all be valid
      expect(validateTheme('dark')).toBe('dark');
      expect(validateTheme('light')).toBe('light');

      // These should all throw
      const invalidValues = [
        'Dark',
        'Light',
        'DARK',
        'LIGHT',
        'auto',
        'system',
        'default',
        ' dark',
        'dark ',
        ' dark ',
        'dark-mode',
        'light-mode',
        123,
        true,
        false,
        null,
        undefined,
        {},
        [],
        Number.NaN,
        Symbol('dark'),
      ];

      invalidValues.forEach((value) => {
        expect(() => validateTheme(value)).toThrow('Invalid theme provided');
      });
    });

    it('should process cookie values consistently', () => {
      // Test that the same logic applies for different input scenarios
      expect(getThemeFromCookieValue('dark')).toBe('dark');
      expect(getThemeFromCookieValue('light')).toBe('light');
      expect(getThemeFromCookieValue(null)).toBe('light');
      expect(getThemeFromCookieValue(undefined)).toBe('light');
      expect(getThemeFromCookieValue('')).toBe('light');
    });
  });
});
