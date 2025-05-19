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

const DATE_FORMAT = 'MM/dd/yyyy hh:mm a';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(
  timestamp: string | Date | null | undefined,
): string {
  if (!timestamp) {
    return 'Never';
  }
  return format(timestamp, DATE_FORMAT);
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
  return format(date, DATE_FORMAT);
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

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper to export a crypto key to a Base64 URL safe string
export async function exportKeyToUrlSafeBase64(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
