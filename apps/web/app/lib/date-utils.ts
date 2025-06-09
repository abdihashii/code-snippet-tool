import {
  differenceInMinutes,
  differenceInSeconds,
  format,
  isFuture,
  isValid,
  parseISO,
} from 'date-fns';

const DATE_FORMAT = 'MM/dd/yyyy hh:mm a';

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
