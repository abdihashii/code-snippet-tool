import { describe, expect, it } from 'vitest';

import {
  PasswordCriterion,
  PasswordSchema,
  PasswordStrengthLevel,
} from '@/lib/schemas';
import { checkPasswordStrength } from '@/lib/utils/password-utils';

describe('passwordSchema', () => {
  it('should pass validation for a strong password', () => {
    const result = PasswordSchema.safeParse('StrongP@ssw0rd!');
    expect(result.success).toBe(true);
  });

  it('should fail validation for password shorter than 8 characters', () => {
    const result = PasswordSchema.safeParse('Short1!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors).toContainEqual(
        expect.objectContaining({
          message: 'Password must be at least 8 characters long.',
        }),
      );
    }
  });

  it('should fail validation for password without uppercase letter', () => {
    const result = PasswordSchema.safeParse('nouppercase1!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors).toContainEqual(
        expect.objectContaining({
          message: 'Password must contain at least one uppercase letter.',
        }),
      );
    }
  });

  it('should fail validation for password without lowercase letter', () => {
    const result = PasswordSchema.safeParse('NOLOWERCASE1!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors).toContainEqual(
        expect.objectContaining({
          message: 'Password must contain at least one lowercase letter.',
        }),
      );
    }
  });

  it('should fail validation for password without number', () => {
    const result = PasswordSchema.safeParse('NoNumberHere!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors).toContainEqual(
        expect.objectContaining({
          message: 'Password must contain at least one number.',
        }),
      );
    }
  });

  it('should fail validation for password without symbol', () => {
    const result = PasswordSchema.safeParse('NoSymbolHere1');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors).toContainEqual(
        expect.objectContaining({
          message: 'Password must contain at least one symbol.',
        }),
      );
    }
  });

  it('should fail validation with multiple issues', () => {
    const result = PasswordSchema.safeParse('bad');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.length).toBeGreaterThan(1);
    }
  });

  it('should pass validation for minimum valid password', () => {
    const result = PasswordSchema.safeParse('Aa1!bcde');
    expect(result.success).toBe(true);
  });
});

describe('checkPasswordStrength', () => {
  describe('tooShort strength', () => {
    it('should return TooShort for password with less than 8 characters', () => {
      const result = checkPasswordStrength('Abc1!');
      expect(result.strength).toBe(PasswordStrengthLevel.TooShort);
      expect(result.score).toBe(0);
      expect(result.criteria).toHaveLength(5);

      const lengthCriterion = result.criteria.find((c) => c.key === PasswordCriterion.Length);
      expect(lengthCriterion?.isMet).toBe(false);
    });

    it('should still show other criteria status for short passwords', () => {
      const result = checkPasswordStrength('A1!');
      expect(result.strength).toBe(PasswordStrengthLevel.TooShort);

      const upperCaseCriterion = result.criteria.find((c) => c.key === PasswordCriterion.UpperCase);
      const numberCriterion = result.criteria.find((c) => c.key === PasswordCriterion.Number);
      const symbolCriterion = result.criteria.find((c) => c.key === PasswordCriterion.Symbol);

      expect(upperCaseCriterion?.isMet).toBe(true);
      expect(numberCriterion?.isMet).toBe(true);
      expect(symbolCriterion?.isMet).toBe(true);
    });
  });

  describe('weak strength', () => {
    it('should return Weak for password with only length requirement', () => {
      const result = checkPasswordStrength('abcdefgh');
      expect(result.strength).toBe(PasswordStrengthLevel.Weak);
      expect(result.score).toBe(1); // Only lowercase character type
    });

    it('should return Weak for password with 1 character type', () => {
      const result = checkPasswordStrength('ABCDEFGH');
      expect(result.strength).toBe(PasswordStrengthLevel.Weak);
      expect(result.score).toBe(1); // Only uppercase character type
    });

    it('should return Weak with score 0 for password with no recognized character types', () => {
      const result = checkPasswordStrength('        '); // 8 spaces
      expect(result.strength).toBe(PasswordStrengthLevel.Weak);
      expect(result.score).toBe(0); // No uppercase, lowercase, numbers, or symbols
    });
  });

  describe('medium strength', () => {
    it('should return Medium for password with 2 character types', () => {
      const result = checkPasswordStrength('Abcdefgh');
      expect(result.strength).toBe(PasswordStrengthLevel.Medium);
      expect(result.score).toBe(2); // Uppercase + lowercase
    });
  });

  describe('strong strength', () => {
    it('should return Strong for password with 3 character types', () => {
      const result = checkPasswordStrength('Abc12345');
      expect(result.strength).toBe(PasswordStrengthLevel.Strong);
      expect(result.score).toBe(3); // Uppercase + lowercase + number
    });

    it('should return Strong for password with all 4 character types', () => {
      const result = checkPasswordStrength('Abc123!@');
      expect(result.strength).toBe(PasswordStrengthLevel.Strong);
      expect(result.score).toBe(4); // Uppercase + lowercase + number + symbol
    });
  });

  describe('veryStrong strength', () => {
    it('should return VeryStrong for password with 4 character types and length >= 12', () => {
      const result = checkPasswordStrength('Abc123!@defg');
      expect(result.strength).toBe(PasswordStrengthLevel.VeryStrong);
      expect(result.score).toBe(5);
    });

    it('should return VeryStrong for very long password with all character types', () => {
      const result = checkPasswordStrength('ThisIsAVeryLongAndSecurePassword123!@#');
      expect(result.strength).toBe(PasswordStrengthLevel.VeryStrong);
      expect(result.score).toBe(5);
    });
  });

  describe('criteria checking', () => {
    it('should correctly identify all criteria for a complete password', () => {
      const result = checkPasswordStrength('MyPassword123!');

      expect(result.criteria).toHaveLength(5);

      const lengthCriterion = result.criteria.find((c) => c.key === PasswordCriterion.Length);
      const upperCaseCriterion = result.criteria.find((c) => c.key === PasswordCriterion.UpperCase);
      const lowerCaseCriterion = result.criteria.find((c) => c.key === PasswordCriterion.LowerCase);
      const numberCriterion = result.criteria.find((c) => c.key === PasswordCriterion.Number);
      const symbolCriterion = result.criteria.find((c) => c.key === PasswordCriterion.Symbol);

      expect(lengthCriterion?.isMet).toBe(true);
      expect(lengthCriterion?.label).toBe('Be at least 8 characters long');

      expect(upperCaseCriterion?.isMet).toBe(true);
      expect(upperCaseCriterion?.label).toBe('Include an uppercase letter');

      expect(lowerCaseCriterion?.isMet).toBe(true);
      expect(lowerCaseCriterion?.label).toBe('Include a lowercase letter');

      expect(numberCriterion?.isMet).toBe(true);
      expect(numberCriterion?.label).toBe('Include a number');

      expect(symbolCriterion?.isMet).toBe(true);
      expect(symbolCriterion?.label).toBe('Include a symbol');
    });

    it('should correctly identify missing criteria', () => {
      const result = checkPasswordStrength('onlylowercase');

      const lengthCriterion = result.criteria.find((c) => c.key === PasswordCriterion.Length);
      const upperCaseCriterion = result.criteria.find((c) => c.key === PasswordCriterion.UpperCase);
      const lowerCaseCriterion = result.criteria.find((c) => c.key === PasswordCriterion.LowerCase);
      const numberCriterion = result.criteria.find((c) => c.key === PasswordCriterion.Number);
      const symbolCriterion = result.criteria.find((c) => c.key === PasswordCriterion.Symbol);

      expect(lengthCriterion?.isMet).toBe(true);
      expect(upperCaseCriterion?.isMet).toBe(false);
      expect(lowerCaseCriterion?.isMet).toBe(true);
      expect(numberCriterion?.isMet).toBe(false);
      expect(symbolCriterion?.isMet).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty password', () => {
      const result = checkPasswordStrength('');
      expect(result.strength).toBe(PasswordStrengthLevel.TooShort);
      expect(result.score).toBe(0);

      const allCriteria = result.criteria.every((c) => !c.isMet);
      expect(allCriteria).toBe(true);
    });

    it('should handle password with exactly 8 characters', () => {
      const result = checkPasswordStrength('Abc123!@');
      expect(result.strength).toBe(PasswordStrengthLevel.Strong);

      const lengthCriterion = result.criteria.find((c) => c.key === PasswordCriterion.Length);
      expect(lengthCriterion?.isMet).toBe(true);
    });

    it('should handle password with exactly 12 characters', () => {
      const result = checkPasswordStrength('Abc123!@defg');
      expect(result.strength).toBe(PasswordStrengthLevel.VeryStrong);
      expect(result.score).toBe(5);
    });

    it('should handle password with special unicode characters', () => {
      const result = checkPasswordStrength('Pässwörd123!');
      expect(result.strength).toBe(PasswordStrengthLevel.VeryStrong);

      const upperCaseCriterion = result.criteria.find((c) => c.key === PasswordCriterion.UpperCase);
      const lowerCaseCriterion = result.criteria.find((c) => c.key === PasswordCriterion.LowerCase);

      expect(upperCaseCriterion?.isMet).toBe(true);
      expect(lowerCaseCriterion?.isMet).toBe(true);
    });

    it('should handle password with various symbols', () => {
      const symbolPassword = 'Password1';
      const symbolTests = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', ',', '.', '?', '"', ':', '{', '}', '|', '<', '>', '='];

      symbolTests.forEach((symbol) => {
        const testPassword = symbolPassword + symbol;
        const result = checkPasswordStrength(testPassword);

        const symbolCriterion = result.criteria.find((c) => c.key === PasswordCriterion.Symbol);
        expect(symbolCriterion?.isMet).toBe(true);
      });
    });

    it('should handle password with only numbers', () => {
      const result = checkPasswordStrength('12345678');
      expect(result.strength).toBe(PasswordStrengthLevel.Weak);

      const numberCriterion = result.criteria.find((c) => c.key === PasswordCriterion.Number);
      expect(numberCriterion?.isMet).toBe(true);

      const upperCaseCriterion = result.criteria.find((c) => c.key === PasswordCriterion.UpperCase);
      const lowerCaseCriterion = result.criteria.find((c) => c.key === PasswordCriterion.LowerCase);
      const symbolCriterion = result.criteria.find((c) => c.key === PasswordCriterion.Symbol);

      expect(upperCaseCriterion?.isMet).toBe(false);
      expect(lowerCaseCriterion?.isMet).toBe(false);
      expect(symbolCriterion?.isMet).toBe(false);
    });

    it('should handle very long password', () => {
      const longPassword = `${'A'.repeat(50)}1!`;
      const result = checkPasswordStrength(longPassword);

      expect(result.strength).toBe(PasswordStrengthLevel.Strong);
      expect(result.score).toBe(4); // uppercase + number + symbol + length bonus
    });
  });

  describe('score calculation edge cases', () => {
    it('should handle exactly minimum length with all character types', () => {
      const result = checkPasswordStrength('Aa1!bcde');
      expect(result.score).toBe(4); // All 4 character types, but < 12 chars
      expect(result.strength).toBe(PasswordStrengthLevel.Strong);
    });

    it('should handle 12+ characters with all character types', () => {
      const result = checkPasswordStrength('Aa1!bcdefghi');
      expect(result.score).toBe(5); // All 4 character types + length bonus
      expect(result.strength).toBe(PasswordStrengthLevel.VeryStrong);
    });

    it('should handle 12+ characters with only some character types', () => {
      const result = checkPasswordStrength('abcdefghijkl');
      expect(result.score).toBe(2); // Only lowercase + length bonus
      expect(result.strength).toBe(PasswordStrengthLevel.Medium);
    });
  });
});
