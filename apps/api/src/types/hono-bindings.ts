import type { DurableObjectRateLimiter } from '@hono-rate-limiter/cloudflare';

export interface CloudflareBindings {
  FRONTEND_URL: string;
  SUPABASE_API_URL: string;
  SUPABASE_ANON_KEY: string;
  CF_CONNECTING_IP?: string; // Cloudflare IP address of the client. Used for rate limiting.

  // Durable Object binding for rate limiting
  RATE_LIMITER: DurableObjectNamespace<DurableObjectRateLimiter>;
}
