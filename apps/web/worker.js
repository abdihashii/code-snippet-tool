/**
 * Cloudflare Worker for adding security headers to the web application
 * This worker proxies requests to the Pages application and injects CSP and other security headers
 *
 * Deployment:
 * 1. Deploy this worker to the same custom domain as your Pages application
 * 2. Configure route in wrangler.toml to match your domain
 *
 * @see https://developers.cloudflare.com/workers/examples/security-headers/
 */

export default {
  async fetch(request, env) {
    // Proxy the request to the Pages application
    const response = await fetch(request);

    // Clone the response to make it mutable
    const newResponse = new Response(response.body, response);

    // Content Security Policy
    // Note: 'unsafe-inline' for scripts is needed for React hydration and PostHog
    // 'unsafe-inline' for styles is needed for Tailwind CSS and shadcn/ui
    // blob: is needed for download functionality (URL.createObjectURL)
    const cspDirectives = [
      'default-src \'self\' blob:',
      'script-src \'self\' \'unsafe-inline\' https://us-assets.i.posthog.com https://us.i.posthog.com',
      'style-src \'self\' \'unsafe-inline\'',
      'img-src \'self\' data: https:',
      'font-src \'self\'',
      `connect-src 'self' ${env.API_URL || 'https://api.abdirahman-haji-13.workers.dev'} https://us.i.posthog.com`,
      'frame-ancestors \'none\'',
      'form-action \'self\'',
      'base-uri \'self\'',
      'upgrade-insecure-requests',
    ];

    newResponse.headers.set(
      'Content-Security-Policy',
      cspDirectives.join('; '),
    );

    // Additional security headers
    newResponse.headers.set('X-Content-Type-Options', 'nosniff');
    newResponse.headers.set('X-Frame-Options', 'DENY');
    newResponse.headers.set('X-XSS-Protection', '1; mode=block');
    newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    newResponse.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    // Strict-Transport-Security (HSTS) - only set for HTTPS
    if (request.url.startsWith('https://')) {
      newResponse.headers.set(
        'Strict-Transport-Security',
        'max-age=63072000; includeSubDomains; preload',
      );
    }

    return newResponse;
  },
};
