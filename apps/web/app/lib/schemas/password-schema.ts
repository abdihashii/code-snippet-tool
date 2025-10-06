import { z } from 'zod';

export enum PasswordStrength {
  TooShort = 'Too Short',
  Weak = 'Weak',
  Medium = 'Medium',
  Strong = 'Strong',
  VeryStrong = 'Very Strong',
}

// Interfaces for detailed criteria analysis
export enum PasswordCriterionKey {
  Length = 'length',
  UpperCase = 'uppercase',
  LowerCase = 'lowercase',
  Number = 'number',
  Symbol = 'symbol',
}

// Interface for a single criterion of the password strength
export interface PasswordCriterion {
  key: PasswordCriterionKey;
  label: string;
  isMet: boolean;
}

// Interface for the password strength analysis
export interface PasswordStrengthAnalysis {
  strength: PasswordStrength;
  score: number; // A numerical score, e.g., 0-5
  criteria: PasswordCriterion[];
}

// Minimum length of a password
export const MIN_PASSWORD_LENGTH = 8;

// Helper functions to check if a password contains certain criteria
const hasUpperCase = (str: string) => /[A-Z]/.test(str);
const hasLowerCase = (str: string) => /[a-z]/.test(str);
const hasNumber = (str: string) => /\d/.test(str);
const hasSymbol = (str: string) => /[!@#$%^&*(),.?":{}|<>=]/.test(str);

// Zod schema for password strength validation.
// This is used to validate the strength of a password before it is used to
// create a snippet. It's non-blocking and used to display a message to the
// user if the password is too weak.
export const PasswordSchema = z.string().superRefine((password, ctx) => {
  if (password.length < MIN_PASSWORD_LENGTH) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_small,
      minimum: MIN_PASSWORD_LENGTH,
      type: 'string',
      inclusive: true,
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
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
