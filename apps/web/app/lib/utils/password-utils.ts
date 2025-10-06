import type { PasswordCriterion, PasswordStrengthAnalysis } from '@/lib/schemas';

import {
  MIN_PASSWORD_LENGTH,
  PasswordCriterionKey,
  PasswordStrength,
} from '@/lib/schemas';

// Helper functions to check if a password contains certain criteria
const hasUpperCase = (str: string) => /[A-Z]/.test(str);
const hasLowerCase = (str: string) => /[a-z]/.test(str);
const hasNumber = (str: string) => /\d/.test(str);
const hasSymbol = (str: string) => /[!@#$%^&*(),.?":{}|<>=]/.test(str);

/**
 * Checks the strength of a password based on the following criteria:
 * - Length: at least 8 characters
 * - Uppercase letter: at least one uppercase letter
 * - Lowercase letter: at least one lowercase letter
 * - Number: at least one number
 * - Symbol: at least one symbol
 *
 * @param password - The password to check the strength of
 * @returns The strength of the password and the criteria that were met
 */
export function checkPasswordStrength(password: string): PasswordStrengthAnalysis {
  const criteriaChecks: PasswordCriterion[] = [
    {
      key: PasswordCriterionKey.Length,
      label: `Be at least ${MIN_PASSWORD_LENGTH} characters long`,
      isMet: password.length >= MIN_PASSWORD_LENGTH,
    },
    {
      key: PasswordCriterionKey.UpperCase,
      label: 'Include an uppercase letter',
      isMet: hasUpperCase(password),
    },
    {
      key: PasswordCriterionKey.LowerCase,
      label: 'Include a lowercase letter',
      isMet: hasLowerCase(password),
    },
    {
      key: PasswordCriterionKey.Number,
      label: 'Include a number',
      isMet: hasNumber(password),
    },
    {
      key: PasswordCriterionKey.Symbol,
      label: 'Include a symbol',
      isMet: hasSymbol(password),
    },
  ];

  // Calculate the score based on the criteria that were met.
  let score = 0;

  if (
    !criteriaChecks.find((c) => c.key === PasswordCriterionKey.Length)?.isMet
  ) {
    // If too short, the strength is "Too Short", score is 0.
    // All other criteria's 'isMet' status is still relevant for UI display.
    return {
      strength: PasswordStrength.TooShort,
      score: 0,
      criteria: criteriaChecks,
    };
  }

  // Calculate score based on met criteria (excluding length for this part of
  // scoring, as it's a base requirement)
  if (criteriaChecks.find(
    (c) => c.key === PasswordCriterionKey.UpperCase,
  )?.isMet) {
    score++;
  }
  if (criteriaChecks.find(
    (c) => c.key === PasswordCriterionKey.LowerCase,
  )?.isMet) {
    score++;
  } // Technically, a good password needs both, but we score them individually.
  if (criteriaChecks.find(
    (c) => c.key === PasswordCriterionKey.Number,
  )?.isMet) {
    score++;
  }
  if (criteriaChecks.find(
    (c) => c.key === PasswordCriterionKey.Symbol,
  )?.isMet) {
    score++;
  }

  // Additional score for length beyond the minimum (if MIN_LENGTH is met)
  if (password.length >= 12) { // This implies MIN_LENGTH is met
    score++;
  }
  // Max score can be 5 (4 from char types + 1 from length >= 12)

  // Determine the strength of the password based on the score.
  let strength: PasswordStrength;
  if (score === 0) { // Only min length met, none of the char types
    strength = PasswordStrength.Weak;
  } else if (score === 1) {
    strength = PasswordStrength.Weak;
  } else if (score === 2) {
    strength = PasswordStrength.Medium;
  } else if (score === 3 || score === 4) {
    strength = PasswordStrength.Strong;
  } else { // score >= 5
    strength = PasswordStrength.VeryStrong;
  }

  return { strength, score, criteria: criteriaChecks };
}
