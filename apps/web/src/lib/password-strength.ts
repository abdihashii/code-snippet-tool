import { z } from 'zod';

export enum PasswordStrength {
  TooShort = 'Too Short',
  Weak = 'Weak',
  Medium = 'Medium',
  Strong = 'Strong',
  VeryStrong = 'Very Strong',
}

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number; // A numerical score, e.g., 0-4 or 0-5
  issues: string[];
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

export function checkPasswordStrength(password: string): PasswordStrengthResult {
  const issues: string[] = [];
  let score = 0;

  if (password.length < MIN_LENGTH) {
    issues.push(`Password must be at least ${MIN_LENGTH} characters long.`);
    // Early exit if too short, as other checks might not make sense or give misleading "strength"
    return { strength: PasswordStrength.TooShort, score: 0, issues };
  }

  // Increment score for each criterion met
  if (hasUpperCase(password)) {
    score++;
  } else {
    issues.push('Password should contain at least one uppercase letter.');
  }

  if (hasLowerCase(password)) {
    score++;
  } else {
    issues.push('Password should contain at least one lowercase letter.');
  }

  if (hasNumber(password)) {
    score++;
  } else {
    issues.push('Password should contain at least one number.');
  }

  if (hasSymbol(password)) {
    score++;
  } else {
    issues.push('Password should contain at least one symbol.');
  }

  // Additional score for length beyond the minimum
  if (password.length >= MIN_LENGTH && password.length < 12) {
    // Already implicitly handled by the base score if all criteria met at min length
  } else if (password.length >= 12) {
    score++; // Extra point for good length
  }

  let strength: PasswordStrength;
  if (score <= 1) {
    strength = PasswordStrength.Weak;
  } else if (score === 2) {
    strength = PasswordStrength.Medium;
  } else if (score === 3 || score === 4) { // Max score from criteria is 4, +1 for length makes 5
    strength = PasswordStrength.Strong;
  } else { // score >= 5
    strength = PasswordStrength.VeryStrong;
  }

  // If the password met the minimum length but failed other criteria, it shouldn't be strong.
  // Ensure "Too Short" takes precedence if length is the primary issue.
  // The current logic handles this by returning early.

  // If score is low despite meeting length, it's still weak.
  if (password.length >= MIN_LENGTH && score < 2) {
    strength = PasswordStrength.Weak;
  }

  return { strength, score, issues };
}
