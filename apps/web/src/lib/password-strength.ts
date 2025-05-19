import { z } from 'zod';

export enum PasswordStrength {
  TooShort = 'Too Short',
  Weak = 'Weak',
  Medium = 'Medium',
  Strong = 'Strong',
  VeryStrong = 'Very Strong',
}

// New interfaces for detailed criteria analysis
export enum PasswordCriterionKey {
  Length = 'length',
  UpperCase = 'uppercase',
  LowerCase = 'lowercase',
  Number = 'number',
  Symbol = 'symbol',
}

export interface PasswordCriterion {
  key: PasswordCriterionKey;
  label: string;
  isMet: boolean;
}

export interface PasswordStrengthAnalysis {
  strength: PasswordStrength;
  score: number; // A numerical score, e.g., 0-5
  criteria: PasswordCriterion[];
}

const MIN_LENGTH = 8;

// Basic criteria
const hasUpperCase = (str: string) => /[A-Z]/.test(str);
const hasLowerCase = (str: string) => /[a-z]/.test(str);
const hasNumber = (str: string) => /\d/.test(str);
const hasSymbol = (str: string) => /[!@#$%^&*(),.?":{}|<>=]/.test(str);

export const PasswordSchema = z.string().superRefine((password, ctx) => {
  if (password.length < MIN_LENGTH) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_small,
      minimum: MIN_LENGTH,
      type: 'string',
      inclusive: true,
      message: `Password must be at least ${MIN_LENGTH} characters long.`,
    });
  }
  if (!hasUpperCase(password)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Password must contain at least one uppercase letter.',
    });
  }
  if (!hasLowerCase(password)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Password must contain at least one lowercase letter.',
    });
  }
  if (!hasNumber(password)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Password must contain at least one number.',
    });
  }
  if (!hasSymbol(password)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Password must contain at least one symbol.',
    });
  }
});

export function checkPasswordStrength(password: string): PasswordStrengthAnalysis {
  const criteriaChecks: PasswordCriterion[] = [
    { key: PasswordCriterionKey.Length, label: `Be at least ${MIN_LENGTH} characters long`, isMet: password.length >= MIN_LENGTH },
    { key: PasswordCriterionKey.UpperCase, label: 'Include an uppercase letter', isMet: hasUpperCase(password) },
    { key: PasswordCriterionKey.LowerCase, label: 'Include a lowercase letter', isMet: hasLowerCase(password) },
    { key: PasswordCriterionKey.Number, label: 'Include a number', isMet: hasNumber(password) },
    { key: PasswordCriterionKey.Symbol, label: 'Include a symbol', isMet: hasSymbol(password) },
  ];

  let score = 0;

  if (!criteriaChecks.find((c) => c.key === PasswordCriterionKey.Length)?.isMet) {
    // If too short, the strength is "Too Short", score is 0.
    // All other criteria's 'isMet' status is still relevant for UI display.
    return { strength: PasswordStrength.TooShort, score: 0, criteria: criteriaChecks };
  }

  // Calculate score based on met criteria (excluding length for this part of scoring, as it's a base requirement)
  if (criteriaChecks.find((c) => c.key === PasswordCriterionKey.UpperCase)?.isMet) score++;
  if (criteriaChecks.find((c) => c.key === PasswordCriterionKey.LowerCase)?.isMet) score++; // Technically, a good password needs both, but we score them individually.
  if (criteriaChecks.find((c) => c.key === PasswordCriterionKey.Number)?.isMet) score++;
  if (criteriaChecks.find((c) => c.key === PasswordCriterionKey.Symbol)?.isMet) score++;

  // Additional score for length beyond the minimum (if MIN_LENGTH is met)
  if (password.length >= 12) { // This implies MIN_LENGTH is met
    score++;
  }
  // Max score can be 5 (4 from char types + 1 from length >= 12)

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
