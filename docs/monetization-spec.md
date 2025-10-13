# Snippet-Share Monetization Spec

## Product Tiers

### 🌐 Anonymous (Free, No Signup)

- **Rate limit:** 5 snippets/day _(already implemented)_
- **Expiry:** 24 hours only
- **Size limit:** 50KB
- **Features:** View once, public links
- **No:** Custom URLs, password protection

### ✉️ Free Account (Email Signup)

- **Rate limit:** 25 snippets/month
- **Expiry:** Up to 7 days
- **Size limit:** 100KB
- **Features:** Custom short URLs, snippet history, dashboard
- **No:** Password protection, analytics, custom domains

### 💎 Pro ($8/mo or $80/yr)

- **Rate limit:** Unlimited
- **Expiry:** Up to 1 year or permanent
- **Size limit:** 10MB
- **Features:** Everything + password protection, custom expiry, analytics (views, geo), API access (1K calls/mo), custom domains

---

## Implementation Phases

### Phase 1: PostHog Events (Week 1-2)

**Goal:** Capture niche discovery data

**Add these events:**

```javascript
posthog.capture('snippet_created', {
  language: 'python', // detect from content
  size_kb: 12,
  expiry_hours: 24,
  is_password_protected: false,
  is_view_once: true,
  user_tier: 'anonymous' // or 'free', 'pro'
})

posthog.capture('snippet_viewed', {
  language: 'python',
  viewer_country: 'US', // from CF headers
  referrer_domain: 'example.com'
})

posthog.capture('rate_limit_hit', {
  user_tier: 'anonymous',
  snippets_today: 5
})

posthog.capture('upgrade_cta_clicked', {
  location: 'rate_limit_banner', // or 'dashboard', 'feature_gate'
  user_tier: 'free'
})
```

**Set user properties:**

```javascript
posthog.identify(userId, {
  tier: 'free',
  signup_date: '2025-10-13',
  snippets_created_total: 47,
  snippets_this_month: 12
})
```

### Phase 2: Accounts (Week 3-4)

**Goal:** Get emails, enable snippet management

- [ ] Email/password + OAuth (GitHub, Google) via Supabase
- [ ]  User dashboard with snippet history
- [ ] Show usage: "12/25 snippets this month"
- [ ] Banner on rate limit hit: "Sign up for 25/month"
- [ ] Track `signup_completed` event

### Phase 3: Pro Tier (Week 5-6)

**Goal:** Launch paid subscriptions

- [ ] Stripe integration
- [ ] Feature gates (use PostHog feature flags: `password_protection_enabled`, `custom_expiry_enabled`)
- [ ] Pricing page with `/pricing`
- [ ] Upgrade flow + success page
- [ ] Track `checkout_started`, `subscription_completed` events

---

## PostHog Setup

### Feature Flags

```javascript
// Gradual rollout of Pro tier
if (posthog.isFeatureEnabled('pro_tier_enabled')) {
  showUpgradeCTA();
}

// A/B test pricing
const pricePoint = posthog.getFeatureFlag('pro_pricing');
// Returns: 'control_8', 'variant_10', 'variant_5'
```

### Cohorts (for targeting)

- **Power Users:** Created 10+ snippets in last 30 days
- **Password Users:** Used rate limit workaround or requested feature
- **Enterprise Domains:** Email domain in [@acme.com, @bigcorp.com, etc.]

### Surveys

Add PostHog survey on homepage:

> "We're launching a Pro tier. What's a fair price for unlimited snippets + password protection?"
> [ ] $5/mo [ ] $8/mo [ ] $10/mo [ ] I'd stay free

Let PostHog handle display logic and response collection.

---

## Database Schema

```sql
-- users table (Supabase)
ALTER TABLE users ADD COLUMN tier TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN snippets_this_month INT DEFAULT 0;
ALTER TABLE users ADD COLUMN quota_reset_date TIMESTAMP;

-- snippets table
ALTER TABLE snippets ADD COLUMN user_id UUID REFERENCES users(id) NULL;
ALTER TABLE snippets ADD COLUMN is_password_protected BOOLEAN DEFAULT false;
ALTER TABLE snippets ADD COLUMN custom_expiry_date TIMESTAMP;
```

---

## Key Metrics (PostHog Insights)

**Niche Discovery:**

- Top languages used (trend over time)
- Password protection request rate
- View-once usage %
- Expiry preference distribution
- Referrer domain breakdown

**Conversion Funnels:**

1. Rate limit hit -> Signup CTA clicked -> Signup completed
2. Signup -> 10 snippets created -> Upgrade CTA clicked -> Checkout
3. Anonymous -> Free -> Pro (full funnel)

**Revenue:**

- Free -> Pro conversion rate (goal: 3-5%)
- MRR, ARPU
- Churn rate by cohort

---

## Rollout Plan

1. **Week 1-2**: Add PostHog events, run survey for 2 weeks
2. **Week 3-4**: Launch Free accounts (use feature flag `accounts_enabled` at 10% -> 100%)
3. **Week 5-6**: Launch Pro tier (use feature flag `pro_tier_enabled` for beta users first)
4. **Week 7**: Full public launch + Show HN post

---

## Success Metrics (90 days)

- 100+ free signups
- 10+ Pro subscribers ($80 MRR)
- Break even on infra ($25/mo)
- Clear niche signal from analytics (e.g., "60% of password requests from .edu domains")
- 3%+ Free -> Pro conversion

---

## Open Questions

- [ ] Annual discount: 20% or 1 month free?
- [ ] Should API access be separate add-on or bundled in Pro?
