import { isFuture, isValid, parseISO } from 'date-fns';

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
