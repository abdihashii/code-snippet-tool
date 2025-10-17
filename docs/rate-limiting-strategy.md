# Rate Limiting Strategy

**Last Updated:** January 16, 2025

## Current Rate Limits

| Endpoint              | Limit | Window     | Purpose                             |
| --------------------- | ----- | ---------- | ----------------------------------- |
| **Global**            | 100   | 15 minutes | All requests                        |
| **POST /snippets**    | 5     | 24 hours   | Snippet creation (abuse prevention) |
| **GET /snippets/:id** | 50    | 1 minute   | Snippet retrieval                   |
| **POST /auth/signup** | 3     | 1 hour     | Account creation                    |

> **Note:** These are technical rate limits for abuse prevention. Business quotas (25/month free, unlimited pro) are tracked separately. See [monetization-spec.md](monetization-spec.md) for subscription tier details.

## Implementation

### Architecture: Cloudflare Durable Objects

Uses `DurableObjectRateLimiter` from `@hono-rate-limiter/cloudflare`.

**Why Durable Objects?**

- ✅ Supports any time window (not limited to 10s/60s like native Workers API)
- ✅ No write frequency limits (unlike KV which has 1 write/second)
- ✅ Strongly consistent (no eventual consistency issues)

### Code Example

```typescript
import { DurableObjectRateLimiter, DurableObjectStore } from '@hono-rate-limiter/cloudflare';
import { rateLimiter } from 'hono-rate-limiter';

// Must export for Durable Objects
export { DurableObjectRateLimiter };

// Global rate limiter
app.use('*', (c, next) =>
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-6',
    keyGenerator: (c) => `global:${getClientIP(c)}`, // ⚠️ Prefix required!
    store: new DurableObjectStore({ namespace: c.env.RATE_LIMITER }),
  })(c, next));

// Snippet creation (5/day)
snippets.post('/', (c, next) =>
  rateLimiter({
    windowMs: 24 * 60 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-6',
    keyGenerator: (c) => `snippet-create:${getClientIP(c)}`, // ⚠️ Different prefix!
    store: new DurableObjectStore({ namespace: c.env.RATE_LIMITER }),
  })(c, next));

function getClientIP(c) {
  return c.env.CF_CONNECTING_IP || c.req.header('x-forwarded-for') || 'anonymous';
}
```

### ⚠️ Critical: Unique Key Prefixes

Multiple rate limiters sharing the same Durable Object namespace **MUST** use unique key prefixes:

| Limiter        | Prefix            | Example Key                  |
| -------------- | ----------------- | ---------------------------- |
| Global         | `global:`         | `global:192.168.1.1`         |
| Snippet Create | `snippet-create:` | `snippet-create:192.168.1.1` |
| Snippet Get    | `snippet-get:`    | `snippet-get:192.168.1.1`    |
| Signup         | `signup:`         | `signup:192.168.1.1`         |

**Without unique prefixes**, all limiters share the same counter → incorrect rate limiting.

### wrangler.jsonc Configuration

```jsonc
{
  "durable_objects": {
    "bindings": [
      { "name": "RATE_LIMITER", "class_name": "DurableObjectRateLimiter" }
    ]
  },
  "migrations": [
    { "tag": "v1", "new_classes": ["DurableObjectRateLimiter"] }
  ]
}
```

## Common Issues & Solutions

### Rate Limiting Triggers Too Early

**Symptoms:** Limit hit on 3rd request instead of 5th/6th

**Cause:** Multiple rate limiters using identical keys (no prefixes)

**Fix:** Add unique prefix to each `keyGenerator`:

```typescript
// ❌ Wrong
keyGenerator: (c) => getClientIP(c)

// ✅ Correct
keyGenerator: (c) => `snippet-create:${getClientIP(c)}`
```

### "Invalid enum value. Expected 10 | 60" Error

**Cause:** Using native Workers Rate Limiting API (only supports 10s/60s periods)

**Fix:** Switch to Durable Objects (supports any time window)

### Rate Limiting Not Working in Dev

**Cause:** Missing Durable Object config in `wrangler.jsonc`

**Fix:** Add binding + migration (see configuration above) and export `DurableObjectRateLimiter` in `index.ts`

## Why Not KV or Native Workers API?

**Workers KV**: Write limit of 1/second per key → breaks on rapid requests

**Native Workers API**: Only supports 10s or 60s periods → can't do 15min, 24h, 1h windows

**Durable Objects**: No limitations, supports any time window, strongly consistent ✅
