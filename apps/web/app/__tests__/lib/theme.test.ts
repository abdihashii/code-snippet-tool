import { getCookie, setCookie } from '@tanstack/react-start/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getThemeFromCookie, setThemeCookie, validateTheme } from '@/lib/theme';

// Mock TanStack Start server functions
vi.mock('@tanstack/react-start/server', () => ({
  getCookie: vi.fn(),
  setCookie: vi.fn(),
}));

const mockGetCookie = vi.mocked(getCookie);
const mockSetCookie = vi.mocked(setCookie);

beforeEach(() => {
  mockGetCookie.mockReset();
  mockSetCookie.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('theme functions', () => {
  describe('getThemeFromCookie', () => {
    it('should return "light" when no cookie exists', () => {
      mockGetCookie.mockReturnValue(undefined);

      const result = getThemeFromCookie();

      expect(mockGetCookie).toHaveBeenCalledWith('ui-theme');
      expect(result).toBe('light');
    });

    it('should return "light" when cookie is null', () => {
      mockGetCookie.mockReturnValue(null as any);

      const result = getThemeFromCookie();

      expect(mockGetCookie).toHaveBeenCalledWith('ui-theme');
      expect(result).toBe('light');
    });

    it('should return "light" when cookie is empty string', () => {
      mockGetCookie.mockReturnValue('');

      const result = getThemeFromCookie();

      expect(mockGetCookie).toHaveBeenCalledWith('ui-theme');
      expect(result).toBe('light');
    });

    it('should return "dark" when cookie value is "dark"', () => {
      mockGetCookie.mockReturnValue('dark');

      const result = getThemeFromCookie();

      expect(mockGetCookie).toHaveBeenCalledWith('ui-theme');
      expect(result).toBe('dark');
    });

    it('should return "light" when cookie value is "light"', () => {
      mockGetCookie.mockReturnValue('light');

      const result = getThemeFromCookie();

      expect(mockGetCookie).toHaveBeenCalledWith('ui-theme');
      expect(result).toBe('light');
    });

    it('should return invalid cookie value as-is (type coercion)', () => {
      mockGetCookie.mockReturnValue('invalid-theme');

      const result = getThemeFromCookie();

      expect(mockGetCookie).toHaveBeenCalledWith('ui-theme');
      expect(result).toBe('invalid-theme');
    });

    it('should throw error when getCookie throws', () => {
      mockGetCookie.mockImplementation(() => {
        throw new Error('Cookie access failed');
      });

      expect(() => getThemeFromCookie()).toThrow('Cookie access failed');
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

  describe('setThemeCookie', () => {
    it('should set cookie with "dark" theme', () => {
      setThemeCookie('dark');

      expect(mockSetCookie).toHaveBeenCalledWith('ui-theme', 'dark');
      expect(mockSetCookie).toHaveBeenCalledTimes(1);
    });

    it('should set cookie with "light" theme', () => {
      setThemeCookie('light');

      expect(mockSetCookie).toHaveBeenCalledWith('ui-theme', 'light');
      expect(mockSetCookie).toHaveBeenCalledTimes(1);
    });

    it('should handle setCookie throwing an error', () => {
      mockSetCookie.mockImplementation(() => {
        throw new Error('Cookie setting failed');
      });

      expect(() => setThemeCookie('dark')).toThrow('Cookie setting failed');
    });
  });

  describe('integration scenarios', () => {
    it('should validate and set valid theme correctly', () => {
      const validTheme = 'dark';
      const validatedTheme = validateTheme(validTheme);

      expect(validatedTheme).toBe('dark');

      setThemeCookie(validatedTheme);

      expect(mockSetCookie).toHaveBeenCalledWith('ui-theme', 'dark');
    });

    it('should throw during validation before reaching handler', () => {
      expect(() => {
        validateTheme('invalid');
      }).toThrow('Invalid theme provided');

      expect(mockSetCookie).not.toHaveBeenCalled();
    });

    it('should use same storage key for both get and set operations', () => {
      mockGetCookie.mockReturnValue('dark');

      const currentTheme = getThemeFromCookie();
      setThemeCookie('light');

      expect(mockGetCookie).toHaveBeenCalledWith('ui-theme');
      expect(mockSetCookie).toHaveBeenCalledWith('ui-theme', 'light');
      expect(currentTheme).toBe('dark');
    });

    it('should handle full theme switching workflow', () => {
      // Get current theme (none exists)
      mockGetCookie.mockReturnValue(undefined);
      const currentTheme = getThemeFromCookie();
      expect(currentTheme).toBe('light');

      // Validate and set new theme
      const newTheme = 'dark';
      const validatedTheme = validateTheme(newTheme);
      setThemeCookie(validatedTheme);

      expect(mockSetCookie).toHaveBeenCalledWith('ui-theme', 'dark');

      // Verify retrieval of new theme
      mockGetCookie.mockReturnValue('dark');
      const updatedTheme = getThemeFromCookie();
      expect(updatedTheme).toBe('dark');
    });

    it('should handle edge case with falsy cookie values', () => {
      // Test various falsy values
      const falsyValues = [null, undefined, '', 0, false, Number.NaN];

      falsyValues.forEach((value) => {
        mockGetCookie.mockReturnValue(value as any);
        const result = getThemeFromCookie();
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
  });
});
