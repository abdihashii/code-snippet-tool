import {
  addHours,
  addMinutes,
  addSeconds,
  subHours,
  subMinutes,
  subSeconds,
} from 'date-fns';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { hasExpiredByTime, hasReachedMaxViews } from '@/lib/utils/expiry-utils';

// Tests for hasReachedMaxViews
describe('hasReachedMaxViews', () => {
  it('should return false if max_views is null (unlimited)', () => {
    expect(hasReachedMaxViews(10, null)).toBe(false);
  });

  it('should return false if current_views is less than max_views', () => {
    expect(hasReachedMaxViews(5, 10)).toBe(false);
  });

  it('should return true if current_views is equal to max_views', () => {
    expect(hasReachedMaxViews(10, 10)).toBe(true);
  });

  it('should return true if current_views is greater than max_views', () => {
    expect(hasReachedMaxViews(11, 10)).toBe(true);
  });

  it('should return false for 0 views when max_views is positive', () => {
    expect(hasReachedMaxViews(0, 5)).toBe(false);
  });

  it('should return true for 0 views when max_views is 0', () => {
    expect(hasReachedMaxViews(0, 0)).toBe(true);
  });
});

// Tests for hasExpiredByTime
describe('hasExpiredByTime', () => {
  const baseTime = new Date(2024, 5, 15, 12, 0, 0); // June 15, 2024, 12:00:00 PM

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(baseTime);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should return false if expires_at is null', () => {
    expect(hasExpiredByTime(null)).toBe(false);
  });

  it('should return false if expires_at is undefined', () => {
    expect(hasExpiredByTime(undefined)).toBe(false);
  });

  it('should return false for an invalid date string', () => {
    expect(hasExpiredByTime('invalid-date-string')).toBe(false);
  });

  it('should return true for a date in the past', () => {
    const pastDate = subMinutes(baseTime, 30);
    expect(hasExpiredByTime(pastDate.toISOString())).toBe(true);
  });

  it('should return true for a date just passed (1 second ago)', () => {
    const pastDate = subSeconds(baseTime, 1);
    expect(hasExpiredByTime(pastDate.toISOString())).toBe(true);
  });

  it('should return false for a date in the future', () => {
    const futureDate = addMinutes(baseTime, 30);
    expect(hasExpiredByTime(futureDate.toISOString())).toBe(false);
  });

  it('should return false for a date far in the future', () => {
    const futureDate = addHours(baseTime, 200);
    expect(hasExpiredByTime(futureDate.toISOString())).toBe(false);
  });

  it('should return true for the exact current time (current time is considered expired)', () => {
    expect(hasExpiredByTime(baseTime.toISOString())).toBe(true);
  });

  it('should return false for 1 second in the future (not expired yet)', () => {
    const futureSecond = addSeconds(baseTime, 1);
    expect(hasExpiredByTime(futureSecond.toISOString())).toBe(false);
  });

  it('should handle Date object input for a past date', () => {
    const pastDate = subHours(baseTime, 2);
    expect(hasExpiredByTime(pastDate)).toBe(true);
  });

  it('should handle Date object input for a future date', () => {
    const futureDate = addHours(baseTime, 2);
    expect(hasExpiredByTime(futureDate)).toBe(false);
  });
});
