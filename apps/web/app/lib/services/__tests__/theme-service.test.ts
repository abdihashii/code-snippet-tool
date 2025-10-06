import { describe, expect, it } from 'vitest';

import { ThemeService } from '@/lib/services';

describe('theme functions', () => {
  describe('getThemeFromCookieValue', () => {
    it('should return "dark" when no cookie exists', () => {
      const result = ThemeService.getThemeFromCookieValue(undefined);
      expect(result).toBe('dark');
    });

    it('should return "dark" when cookie is null', () => {
      const result = ThemeService.getThemeFromCookieValue(null);
      expect(result).toBe('dark');
    });

    it('should return "dark" when cookie is empty string', () => {
      const result = ThemeService.getThemeFromCookieValue('');
      expect(result).toBe('dark');
    });

    it('should return "dark" when cookie value is "dark"', () => {
      const result = ThemeService.getThemeFromCookieValue('dark');
      expect(result).toBe('dark');
    });

    it('should return "light" when cookie value is "light"', () => {
      const result = ThemeService.getThemeFromCookieValue('light');
      expect(result).toBe('light');
    });

    it('should return invalid cookie value as-is (type coercion)', () => {
      const result = ThemeService.getThemeFromCookieValue('invalid-theme');
      expect(result).toBe('invalid-theme');
    });
  });

  describe('validateTheme', () => {
    describe('valid inputs', () => {
      it('should accept "dark" theme', () => {
        const result = ThemeService.validateTheme('dark');
        expect(result).toBe('dark');
      });

      it('should accept "light" theme', () => {
        const result = ThemeService.validateTheme('light');
        expect(result).toBe('light');
      });
    });

    describe('invalid inputs', () => {
      it('should throw error for non-string input', () => {
        expect(() => ThemeService.validateTheme(123)).toThrow('Invalid theme provided');
      });

      it('should throw error for null input', () => {
        expect(() => ThemeService.validateTheme(null)).toThrow('Invalid theme provided');
      });

      it('should throw error for undefined input', () => {
        expect(() => ThemeService.validateTheme(undefined)).toThrow('Invalid theme provided');
      });

      it('should throw error for empty string', () => {
        expect(() => ThemeService.validateTheme('')).toThrow('Invalid theme provided');
      });

      it('should throw error for object input', () => {
        expect(() => ThemeService.validateTheme({})).toThrow('Invalid theme provided');
      });

      it('should throw error for array input', () => {
        expect(() => ThemeService.validateTheme([])).toThrow('Invalid theme provided');
      });

      it('should throw error for boolean input', () => {
        expect(() => ThemeService.validateTheme(true)).toThrow('Invalid theme provided');
      });

      it('should throw error for invalid theme string', () => {
        expect(() => ThemeService.validateTheme('auto')).toThrow('Invalid theme provided');
      });

      it('should throw error for theme with wrong case', () => {
        expect(() => ThemeService.validateTheme('Dark')).toThrow('Invalid theme provided');
      });

      it('should throw error for theme with extra characters', () => {
        expect(() => ThemeService.validateTheme('dark-mode')).toThrow('Invalid theme provided');
      });
    });
  });

  describe('integration scenarios', () => {
    it('should validate and process theme correctly', () => {
      const validTheme = 'dark';
      const validatedTheme = ThemeService.validateTheme(validTheme);

      expect(validatedTheme).toBe('dark');

      // Test the cookie value processing
      const processedTheme = ThemeService.getThemeFromCookieValue(validatedTheme);
      expect(processedTheme).toBe('dark');
    });

    it('should throw during validation before reaching handler', () => {
      expect(() => {
        ThemeService.validateTheme('invalid');
      }).toThrow('Invalid theme provided');
    });

    it('should handle full theme switching workflow', () => {
      // Get current theme (none exists)
      const currentTheme = ThemeService.getThemeFromCookieValue(undefined);
      expect(currentTheme).toBe('dark');

      // Validate and set new theme
      const newTheme = 'light';
      const validatedTheme = ThemeService.validateTheme(newTheme);
      expect(validatedTheme).toBe('light');

      // Verify retrieval of new theme
      const updatedTheme = ThemeService.getThemeFromCookieValue('light');
      expect(updatedTheme).toBe('light');
    });

    it('should handle edge case with falsy cookie values', () => {
      // Test various falsy values
      const falsyValues = [null, undefined, '', 0, false, Number.NaN];

      falsyValues.forEach((value) => {
        const result = ThemeService.getThemeFromCookieValue(value as any);
        expect(result).toBe('dark');
      });
    });

    it('should maintain type safety in validation', () => {
      // These should all be valid
      expect(ThemeService.validateTheme('dark')).toBe('dark');
      expect(ThemeService.validateTheme('light')).toBe('light');

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
        expect(() => ThemeService.validateTheme(value)).toThrow('Invalid theme provided');
      });
    });

    it('should process cookie values consistently', () => {
      // Test that the same logic applies for different input scenarios
      expect(ThemeService.getThemeFromCookieValue('dark')).toBe('dark');
      expect(ThemeService.getThemeFromCookieValue('light')).toBe('light');
      expect(ThemeService.getThemeFromCookieValue(null)).toBe('dark');
      expect(ThemeService.getThemeFromCookieValue(undefined)).toBe('dark');
      expect(ThemeService.getThemeFromCookieValue('')).toBe('dark');
    });
  });
});
