import type { ClassValue } from 'clsx';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/* v8 ignore next 3 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}