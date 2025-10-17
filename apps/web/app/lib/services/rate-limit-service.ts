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

export function formatRateLimitMessage(): string {
  // Keep it simple and friendly - don't show specific times that can mismatch with the banner
  // The banner's live countdown is the source of truth for exact timing
  return 'Rate limit exceeded.';
}
