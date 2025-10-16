export interface CloudflareBindings {
  FRONTEND_URL: string;
  SUPABASE_API_URL: string;
  SUPABASE_ANON_KEY: string;
  CF_CONNECTING_IP?: string; // Cloudflare IP address of the client. Used for rate limiting.

  // Cloudflare Workers Rate Limiting API bindings
  GLOBAL_RATE_LIMITER: RateLimit; // Global rate limiter: 100 requests per 15 minutes
  SNIPPET_CREATE_RATE_LIMITER: RateLimit; // Snippet creation: 5 requests per 24 hours
  SNIPPET_GET_RATE_LIMITER: RateLimit; // Snippet retrieval: 50 requests per 1 minute
  SIGNUP_RATE_LIMITER: RateLimit; // Signup attempts: 3 requests per 1 hour
}
