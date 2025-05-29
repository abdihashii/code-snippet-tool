import {
  addHours,
  addMinutes,
  addSeconds,
  format,
  subHours,
  subMinutes,
  subSeconds,
} from 'date-fns';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  formatExpiryTimestamp,
  formatTimestamp,
  hasExpiredByTime,
  hasReachedMaxViews,
} from '@/lib/utils';

// Tests for formatTimestamp
describe('formatTimestamp', () => {
  const testDate = new Date(2035, 11, 31, 0, 0, 0); // December 31, 2035, 12:00:00 AM
  const expectedFormat = '12/31/2035 12:00 AM';

  it('should return "Never" for null input', () => {
    expect(formatTimestamp(null)).toBe('Never');
  });

  it('should return "Never" for undefined input', () => {
    expect(formatTimestamp(undefined)).toBe('Never');
  });

  it('should format a Date object correctly', () => {
    expect(formatTimestamp(testDate)).toBe(expectedFormat);
  });

  it('should format an ISO string correctly', () => {
    expect(formatTimestamp(testDate.toISOString())).toBe(expectedFormat);
  });

  it('should handle noon correctly', () => {
    const noonDate = new Date(2024, 5, 15, 12, 0, 0);
    expect(formatTimestamp(noonDate)).toBe('06/15/2024 12:00 PM');
  });

  it('should handle afternoon time correctly', () => {
    const afternoonDate = new Date(2024, 5, 15, 14, 30, 0);
    expect(formatTimestamp(afternoonDate)).toBe('06/15/2024 02:30 PM');
  });

  it('should handle single digit minutes correctly', () => {
    const singleDigitMinute = new Date(2024, 5, 15, 14, 5, 0);
    expect(formatTimestamp(singleDigitMinute)).toBe('06/15/2024 02:05 PM');
  });

  it('should handle different years correctly', () => {
    const differentYear = new Date(2025, 11, 31, 23, 59, 0);
    expect(formatTimestamp(differentYear)).toBe('12/31/2025 11:59 PM');
  });
});

// Tests for formatExpiryTimestamp
describe('formatExpiryTimestamp', () => {
  // June 15, 2025, 12:00:00 PM
  const baseTime = new Date(2025, 5, 15, 12, 0, 0);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(baseTime);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('"Never" State', () => {
    it('should return "Never" for null input', () => {
      expect(formatExpiryTimestamp(null)).toBe('Never');
    });

    it('should return "Never" for undefined input', () => {
      expect(formatExpiryTimestamp(undefined)).toBe('Never');
    });

    it('should return "Never" for an invalid date string', () => {
      expect(formatExpiryTimestamp('invalid-date-string')).toBe('Never');
    });
  });

  describe('"Expired" State', () => {
    it('should return "Expired" for a date in the past', () => {
      const pastDate = subMinutes(baseTime, 30);
      expect(formatExpiryTimestamp(pastDate.toISOString())).toBe('Expired');
    });

    it('should return "Expired" for a date just passed', () => {
      const pastDate = subSeconds(baseTime, 1);
      expect(formatExpiryTimestamp(pastDate.toISOString())).toBe('Expired');
    });
  });

  describe('"Future - Within 1 Minute"', () => {
    it(
      'should return "in 0 seconds" for a date less than 1 second in the future',
      () => {
        // Simulate a time that is in the future but rounds down to 0 full
        // seconds difference. 0.5 seconds in the future
        const futureDate = new Date(baseTime.getTime() + 500);
        expect(
          formatExpiryTimestamp(futureDate.toISOString()),
        ).toBe('in 0 seconds');
      },
    );

    it(
      'should return "in 30 seconds" for a date 30 seconds in the future',
      () => {
        const futureDate = addSeconds(baseTime, 30);
        expect(
          formatExpiryTimestamp(futureDate.toISOString()),
        ).toBe('in 30 seconds');
      },
    );

    it(
      'should return "in 1 second" for a date 1 second in the future',
      () => {
        const futureDate = addSeconds(baseTime, 1);
        expect(
          formatExpiryTimestamp(futureDate.toISOString()),
        ).toBe('in 1 second');
      },
    );

    it(
      'should return "in 59 seconds" for a date 59 seconds in the future',
      () => {
        const futureDate = addSeconds(baseTime, 59);
        expect(
          formatExpiryTimestamp(futureDate.toISOString()),
        ).toBe('in 59 seconds');
      },
    );
  });

  describe('"Future - Within 1 Hour (but > 1 minute)"', () => {
    it(
      'should return "in 1 minute" for a date exactly 1 minute in the future',
      () => {
        const futureDate = addMinutes(baseTime, 1);
        expect(
          formatExpiryTimestamp(futureDate.toISOString()),
        ).toBe('in 1 minute');
      },
    );

    it(
      'should return "in 1 minute" for a date 1 minute and a few seconds in the future',
      () => {
        const futureDate = addSeconds(addMinutes(baseTime, 1), 30);
        expect(
          formatExpiryTimestamp(futureDate.toISOString()),
        ).toBe('in 1 minute');
      },
    );

    it(
      'should return "in X minutes" for a date less than 60 minutes in the future',
      () => {
        const futureDate = addMinutes(baseTime, 45);
        expect(
          formatExpiryTimestamp(futureDate.toISOString()),
        ).toBe('in 45 minutes');
      },
    );

    it(
      'should return "in 59 minutes" for a date 59 minutes and 30 seconds in the future',
      () => {
        const futureDate = addSeconds(addMinutes(baseTime, 59), 30);
        expect(
          formatExpiryTimestamp(futureDate.toISOString()),
        ).toBe('in 59 minutes');
      },
    );
  });

  describe('"Future - 1 Hour or More"', () => {
    it(
      'should return formatted date for a date exactly 60 minutes in the future',
      () => {
        const futureDate = addMinutes(baseTime, 60);
        expect(
          formatExpiryTimestamp(futureDate.toISOString()),
        ).toBe(format(futureDate, 'MM/dd/yyyy hh:mm a'));
      },
    );

    it(
      'should return formatted date for a date more than 1 hour in the future',
      () => {
        const futureDate = addHours(baseTime, 2);
        expect(
          formatExpiryTimestamp(futureDate.toISOString()),
        ).toBe(format(futureDate, 'MM/dd/yyyy hh:mm a'));
      },
    );

    it('should return formatted date for a date far in the future', () => {
      const futureDate = addHours(baseTime, 200); // More than a week
      expect(
        formatExpiryTimestamp(futureDate.toISOString()),
      ).toBe(format(futureDate, 'MM/dd/yyyy hh:mm a'));
    });
  });

  describe('input Type Handling', () => {
    it(
      'should handle Date object as input correctly for a future date',
      () => {
        const futureDate = addMinutes(baseTime, 30);
        expect(formatExpiryTimestamp(futureDate)).toBe('in 30 minutes');
      },
    );

    it('should handle Date object as input correctly for a past date', () => {
      const pastDate = subHours(baseTime, 2);
      expect(formatExpiryTimestamp(pastDate)).toBe('Expired');
    });
  });
});

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
