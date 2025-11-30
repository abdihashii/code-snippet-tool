import type { DurableObjectRateLimiter } from '@hono-rate-limiter/cloudflare';

export interface CloudflareBindings {
  FRONTEND_URL: string;
  SUPABASE_API_URL: string;
  SUPABASE_ANON_KEY: string;
  CF_CONNECTING_IP?: string; // Cloudflare IP address of the client. Used for rate limiting.

  // Durable Object binding for rate limiting
  RATE_LIMITER: DurableObjectNamespace<DurableObjectRateLimiter>;

  // Better Auth bindings
  SUPABASE_DB_URL: string;
  BETTER_AUTH_SECRET: string;
  API_URL: string;

  // OAuth provider credentials
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}
