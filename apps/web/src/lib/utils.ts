import type { ClassValue } from 'clsx';

import { clsx } from 'clsx';
import { differenceInMinutes, format, isFuture, isValid, parseISO } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatExpiryTimestamp(
  expiresAt: string | Date | null | undefined,
): string {
  if (!expiresAt) {
    return 'Never';
  }

  const date = typeof expiresAt === 'string' ? parseISO(expiresAt) : expiresAt;

  if (!isValid(date)) {
    return 'Never'; // Or handle invalid date string appropriately
  }

  if (!isFuture(date)) {
    return 'Expired';
  }

  const now = new Date();
  const diffMinutes = differenceInMinutes(date, now);

  if (diffMinutes < 1) {
    return 'in less than a minute';
  }
  if (diffMinutes < 60) {
    return `in ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'}`;
  }
  return format(date, 'MM/dd/yyyy hh:mm a');
}
