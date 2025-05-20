const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBER_CHARS = '0123456789';
// Symbols consistent with the regex in password-strength.ts: /[!@#$%^&*(),.?":{}|<>=]/
const SYMBOL_CHARS = '!@#$%^&*(),.?":{}|<>=_-'; // Added underscore and hyphen for more variety, commonly accepted symbols

const ALL_CHARS
= LOWERCASE_CHARS + UPPERCASE_CHARS + NUMBER_CHARS + SYMBOL_CHARS;

/**
 * Generates a cryptographically secure random number within a range.
 *
 * @param max The exclusive maximum value.
 * @returns A random number between 0 (inclusive) and max (exclusive).
 */
function getRandomInt(max: number): number {
  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);
  return randomBuffer[0] % max;
}

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 *
 * @param array The array to shuffle.
 * @returns The shuffled array.
 */
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Generates a strong, random password that meets defined criteria.
 * The password will be 16 characters long and include at least one lowercase
 * letter, one uppercase letter, one number, and one symbol.
 *
 * @returns A randomly generated strong password.
 */
export function generateStrongPassword(): string {
  const passwordLength = 16;
  const passwordChars: string[] = [];

  // 1. Ensure at least one of each required character type
  passwordChars.push(LOWERCASE_CHARS[getRandomInt(LOWERCASE_CHARS.length)]);
  passwordChars.push(UPPERCASE_CHARS[getRandomInt(UPPERCASE_CHARS.length)]);
  passwordChars.push(NUMBER_CHARS[getRandomInt(NUMBER_CHARS.length)]);
  passwordChars.push(SYMBOL_CHARS[getRandomInt(SYMBOL_CHARS.length)]);

  // 2. Fill the remaining length with random characters from all allowed types
  const remainingLength = passwordLength - passwordChars.length;
  for (let i = 0; i < remainingLength; i++) {
    passwordChars.push(ALL_CHARS[getRandomInt(ALL_CHARS.length)]);
  }

  // 3. Shuffle the array to ensure randomness and avoid predictable patterns
  shuffleArray(passwordChars);

  return passwordChars.join('');
}

// Example of how you might use it with the schema (for testing or other utils):
/*
import { PasswordSchema } from './password-strength';

export function generateAndValidatePassword(): string {
  let password = '';
  let isValid = false;
  let attempts = 0;

  do {
    password = generateStrongPassword();
    const validationResult = PasswordSchema.safeParse(password);
    isValid = validationResult.success;
    attempts++;
    if (attempts > 10 && !isValid) { // Safety break for unexpected issues
      console.error("Failed to generate a valid password after 10 attempts", validationResult.error?.errors);
      throw new Error("Password generation failed to meet schema requirements.");
    }
  } while (!isValid);

  return password;
}
*/
