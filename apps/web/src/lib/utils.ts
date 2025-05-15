import type { ClassValue } from 'clsx';

import { clsx } from 'clsx';
import {
  differenceInMinutes,
  differenceInSeconds,
  format,
  isFuture,
  isValid,
  parseISO,
} from 'date-fns';
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
  const diffSeconds = differenceInSeconds(date, now);

  if (diffSeconds < 60) {
    return `in ${diffSeconds} second${diffSeconds === 1 ? '' : 's'}`;
  }

  const diffMinutes = differenceInMinutes(date, now);

  if (diffMinutes < 60) {
    return `in ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'}`;
  }
  return format(date, 'MM/dd/yyyy hh:mm a');
}

export function hasReachedMaxViews(
  current_views: number,
  max_views: number | null,
): boolean {
  if (max_views === null) {
    return false; // Unlimited views
  }
  return current_views >= max_views;
}

export function hasExpiredByTime(
  expires_at: string | Date | null | undefined,
): boolean {
  if (!expires_at) {
    return false; // Never expires
  }

  const date = typeof expires_at === 'string'
    ? parseISO(expires_at)
    : expires_at;

  if (!isValid(date)) {
    return false; // Invalid date string, treat as not expired
  }

  return !isFuture(date);
}
