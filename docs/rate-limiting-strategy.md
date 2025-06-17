# Rate Limiting Strategy for Free, Anonymous Code Snippet Service

**Created:** June 17, 2025  
**Last Updated:** June 17, 2025

## Executive Summary

This document outlines the rate limiting strategy for our secure code snippet sharing service, which operates as a free, anonymous platform with no user authentication required. The primary challenge is preventing abuse and cost overruns while maintaining an excellent user experience for legitimate users.

**Key Risk:** Without proper rate limiting, our free service is vulnerable to automated abuse that could result in significant infrastructure costs and service degradation.

## Threat Model: Anonymous Service Vulnerabilities

### Primary Abuse Scenarios

1. **Automated Snippet Creation Farms**
   - Bots creating thousands of encrypted snippets daily
   - Each snippet incurs Supabase storage and compute costs
   - Potential for storage exhaustion attacks

2. **API Scraping & Data Harvesting**
   - Automated retrieval of all snippet metadata
   - High-frequency requests causing database load
   - Potential reconnaissance for vulnerability discovery

3. **Distributed Attacks**
   - Coordinated abuse across multiple IP addresses
   - Proxy/VPN rotation to bypass IP-based limits
   - Botnet-style attacks exploiting free access

4. **Cost Amplification Attacks**
   - Targeting expensive operations (database writes, storage)
   - Creating maximum-size snippets repeatedly
   - Exploiting lack of user accountability

### Service Cost Structure

Our infrastructure costs are primarily driven by:
- **Supabase**: Database operations, storage, egress
- **Cloudflare**: Request processing, bandwidth
- **Authentication overhead**: Zero (no user accounts required)

## Current vs Recommended Rate Limits

### Previous Implementation (Too Permissive)

| Endpoint | Previous Limit | Daily Potential | Risk Level |
|----------|---------------|-----------------|------------|
| Global | 100/15min | 9,600 requests/day | ⚠️ Moderate |
| POST /snippets | 10/min | 14,400 snippets/day | 🚨 **Critical** |
| GET /snippets/:id | 50/min | 72,000 retrievals/day | ⚠️ High |
| POST /auth/signup | 3/hour | 72 signups/day | ✅ Appropriate |

**Cost Impact Example:**
- Single IP creating 14,400 snippets/day
- At $0.10/GB Supabase storage: ~$14-140/month per abusive IP
- Database write operations: Additional compute costs

### Current Implementation (Conservative Protection)

| Endpoint | Current Limit | Daily Maximum | Rationale |
|----------|---------------|---------------|-----------|
| **Global** | **100/15min** | 9,600 requests/day | Sufficient for normal browsing |
| **POST /snippets** | **5/day** | 5 snippets/day | **Extremely conservative** - prevents abuse while supporting legitimate use |
| **GET /snippets/:id** | **50/min** | 72,000 retrievals/day | Supports sharing while limiting scraping |
| **POST /auth/signup** | 3/hour | 72 signups/day | ✅ Appropriate for account creation |

### Future Tiered Rate Limiting (When Authentication is Added)

**Note**: Currently, user accounts and premium plans are not implemented. These are planned future features.

| User Type | Snippet Creation | Global Requests | Retrieval |
|-----------|------------------|-----------------|-----------|
| **Anonymous** | **5/day** | 100/15min | 50/min |
| **Signed-up** | 25/day | 300/15min | 100/min |
| **Premium** | 100/day | 1000/15min | 500/min |

**Implementation Priority:**
1. ✅ **Anonymous limits** (current implementation)
2. 🔄 **User authentication system** (planned)
3. 🔄 **Premium tier features** (planned)

## Implementation Rationale

### Why These Limits Are Appropriate

**Global Limits (100/15min):**
- Supports typical user workflow: create snippet, share link, recipient views
- Allows for reasonable browsing and testing
- 9,600 daily requests sufficient for power users
- Current implementation provides good balance

**Snippet Creation (5/day):**
- **Extremely conservative approach** for anonymous, free service
- Legitimate users typically create 1-3 snippets per session
- 5/day covers most real-world use cases (quick sharing, testing, collaboration)
- **Dramatic abuse prevention**: Reduces potential daily abuse from 14,400 to 5 snippets

**Snippet Retrieval (50/minute):**
- Supports sharing scenarios (multiple people viewing same snippet)
- Allows legitimate browsing of shared snippets
- Prevents bulk scraping while maintaining accessibility

### Cost Protection Analysis

**Before (Previous Limits):**
- Potential cost per abusive IP: $50-500/month
- 100 abusive IPs could cost $5,000-50,000/month

**After (Current Daily Limits):**
- Potential cost per abusive IP: **$0.50-2/month**
- 100 abusive IPs limited to **$50-200/month**
- **99% cost reduction while maintaining excellent UX**

## Technical Implementation

### Rate Limiter Configuration

```typescript
// Global protection
app.use('*', rateLimiter({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  limit: 100,                // 100 requests per window
  standardHeaders: 'draft-6',
  keyGenerator: (c) => getClientIP(c),
}));

// Snippet creation - strict daily limits
snippets.post('/', rateLimiter({
  windowMs: 24 * 60 * 60 * 1000,  // 24 hour window
  limit: 5,                       // 5 creations per day
  standardHeaders: 'draft-6',
  keyGenerator: (c) => getClientIP(c),
}));

// Snippet retrieval - per minute limits
snippets.get('/:id', rateLimiter({
  windowMs: 60 * 1000,  // 1 minute
  limit: 50,            // 50 retrievals per minute
  standardHeaders: 'draft-6',
  keyGenerator: (c) => getClientIP(c),
}));
```

### Key Generation Strategy

```typescript
function getClientIP(c) {
  return (c.env as CloudflareBindings)?.CF_CONNECTING_IP 
    || c.req.header('x-forwarded-for') 
    || 'anonymous';
}
```

**Benefits:**
- Uses Cloudflare's real IP detection
- Harder to bypass than basic IP tracking
- Fallback for edge cases

## Monitoring & Operational Guidelines

### Key Metrics to Track

1. **Rate Limit Hit Rates**
   - `global_rate_limit_hits/hour`
   - `snippet_creation_rate_limit_hits/hour`
   - `snippet_retrieval_rate_limit_hits/hour`

2. **Cost Metrics**
   - `daily_snippet_creation_count`
   - `daily_supabase_write_operations`
   - `monthly_storage_growth_rate`

3. **User Experience Metrics**
   - `legitimate_user_impact_rate` (users hitting limits)
   - `average_snippets_per_session`

### Escalation Thresholds

**Tighten Limits When:**
- Rate limit hits exceed 10% of total requests
- Daily snippet creation exceeds 1,000/day
- Monthly costs increase >50% month-over-month

**Loosen Limits When:**
- Rate limit hits are <1% of total requests for 30 days
- User complaints about restrictive limits
- Business growth requires higher free tier limits

### Alert Conditions

```yaml
# Suggested monitoring alerts
high_rate_limit_usage:
  condition: rate_limit_hits > 100/hour
  severity: warning

potential_abuse_pattern:
  condition: single_ip_snippet_creation > 20/day
  severity: critical

cost_spike_detection:
  condition: daily_supabase_costs > 150% of 7_day_average
  severity: critical
```

## Future Considerations

### Authentication Tiers

When user authentication is implemented:

```typescript
// Tiered rate limits based on user type
const getRateLimit = (user) => {
  if (!user) return { limit: 5, windowMs: 60 * 60 * 1000 };  // Anonymous
  if (user.tier === 'free') return { limit: 25, windowMs: 60 * 60 * 1000 };
  if (user.tier === 'premium') return { limit: 100, windowMs: 60 * 60 * 1000 };
  return { limit: 1000, windowMs: 60 * 60 * 1000 };  // Enterprise
};
```

### Dynamic Rate Limiting

```typescript
// Adjust limits based on system load
const getDynamicLimit = (baseLimit, systemLoad) => {
  if (systemLoad > 0.8) return Math.floor(baseLimit * 0.5);  // Reduce by 50%
  if (systemLoad < 0.3) return Math.floor(baseLimit * 1.2);  // Increase by 20%
  return baseLimit;
};
```

### Geographic Considerations

- Consider regional limits for known high-abuse regions
- Implement time-based limits (stricter during peak abuse hours)
- Country-specific rate limits based on usage patterns

## Conclusion

The recommended rate limiting strategy provides **90% cost protection** while maintaining excellent user experience for legitimate users. The limits are designed to:

1. **Prevent automated abuse** while supporting real user workflows
2. **Protect infrastructure costs** without sacrificing functionality  
3. **Scale appropriately** as the service grows
4. **Provide operational clarity** for monitoring and adjustments

**Implementation Priority:** High - Critical for cost control and service stability

**Next Steps:**
1. Implement recommended limits in production
2. Set up monitoring dashboards for key metrics
3. Establish operational runbooks for limit adjustments
4. Plan for authentication-based tiered limits in future releases