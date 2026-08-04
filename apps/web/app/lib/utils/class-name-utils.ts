/* c8 ignore start */
import type { ClassValue } from 'clsx';

import { clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// tailwind-merge treats any `text-*` it does not recognise as a color, so it
// drops the real color when it meets a DS type token. Listing the scale keeps
// `cn('text-primary-foreground', 'text-caption')` intact.
// app.css owns these names. A test fails if the two drift.
export const DS_TEXT_TOKENS = [
  'micro',
  'caption',
  'body',
  'wordmark',
  'card-title',
  'lockup',
  'hero',
  'code',
];

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: DS_TEXT_TOKENS,
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
/* c8 ignore end */
