import type { RateLimitInfo } from '@snippet-share/types';

export class RateLimitError extends Error {
  public rateLimitInfo: RateLimitInfo;

  constructor(rateLimitInfo: RateLimitInfo, message?: string) {
    super(message || 'Rate limit exceeded. Please try again later.');
    this.name = 'RateLimitError';
    this.rateLimitInfo = rateLimitInfo;
  }
}

export function extractRateLimitInfo(response: Response): RateLimitInfo {
  const parseHeader = (value: string | null): number | null => {
    if (!value) return null;
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  };

  return {
    // Use lowercase header names to match hono-rate-limiter output
    limit: parseHeader(response.headers.get('ratelimit-limit')),
    remaining: parseHeader(response.headers.get('ratelimit-remaining')),
    reset: parseHeader(response.headers.get('ratelimit-reset')),
    retryAfter: parseHeader(response.headers.get('retry-after')),
  };
}

export function formatRateLimitMessage(rateLimitInfo: RateLimitInfo): string {
  const { retryAfter, reset } = rateLimitInfo;

  if (retryAfter && retryAfter > 0) {
    const minutes = Math.ceil(retryAfter / 60);
    return minutes === 1
      ? `Rate limit exceeded. Please try again in 1 minute.`
      : `Rate limit exceeded. Please try again in ${minutes} minutes.`;
  }

  if (reset) {
    const resetDate = new Date(reset * 1000);
    const now = new Date();
    const diffMinutes = Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60));

    if (diffMinutes > 0) {
      return diffMinutes === 1
        ? `Rate limit exceeded. Please try again in 1 minute.`
        : `Rate limit exceeded. Please try again in ${diffMinutes} minutes.`;
    }
  }

  return 'Rate limit exceeded. Please try again later.';
}
