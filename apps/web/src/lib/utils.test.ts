import { addHours, addMinutes, addSeconds, format, subHours, subMinutes, subSeconds } from 'date-fns';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { formatExpiryTimestamp } from './utils';

describe('formatExpiryTimestamp', () => {
  // June 15, 2024, 12:00:00 PM
  const baseTime = new Date(2024, 5, 15, 12, 0, 0);

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
      'should return "in less than a minute" for a date less than 1 minute in the future',
      () => {
        const futureDate = addSeconds(baseTime, 30);
        expect(
          formatExpiryTimestamp(futureDate.toISOString()),
        ).toBe('in less than a minute');
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
