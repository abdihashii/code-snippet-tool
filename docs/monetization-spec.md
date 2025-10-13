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
- **Features:** Custom short URLs, snippet history, dashboard, password protection _(already implemented)_
- **No:** Analytics, custom domains, API access

### 💎 Pro ($8/mo or $80/yr)

- **Rate limit:** Unlimited
- **Expiry:** Up to 1 year or permanent
- **Size limit:** 10MB
- **Features:** Everything + analytics (views, geo), API access (1K calls/mo), custom domains, priority support

---

## Technical Prerequisites

Before implementing monetization, the following must be built:

### Authentication System
- [ ] Complete login/logout flow (currently only signup endpoint exists)
- [ ] Session management with Supabase Auth
- [ ] Protected routes and auth middleware
- [ ] OAuth providers (GitHub, Google) via Supabase

### Database Schema
- [ ] Create `public.profiles` table (see schema section below)
- [ ] Add Row Level Security (RLS) policies
- [ ] Foreign key from `snippets.user_id` to `profiles.id`
- [ ] Migration for existing anonymous snippets

### User Dashboard
- [ ] Dashboard route (`/dashboard`)
- [ ] List user's snippets with metadata
- [ ] Usage stats display ("12/25 snippets this month")
- [ ] Delete snippet functionality

### Feature Gates
- [ ] Tier-aware size validation (50KB/100KB/10MB)
- [ ] Tier-aware expiry options (24h/7d/1yr)
- [ ] Monthly quota tracking system (see **Quota Tracking Strategy** below)

### Quota Tracking Strategy

**Decision needed:** How to enforce "25 snippets/month" for free users?

**Option A: Database Counter (Recommended)**
- ✅ Accurate: Guarantees exact quota enforcement
- ✅ Simple: Use `profiles.snippets_this_month` + PostgreSQL trigger
- ✅ Audit trail: Easy to query user's monthly usage
- ❌ DB hit: Every snippet creation requires a database UPDATE
- **Implementation:** Increment counter on snippet create, reset via scheduled function

**Option B: Cloudflare KV with Monthly Window**
- ✅ Fast: No database hit, uses existing rate limiter
- ❌ Approximate: KV expiration not exact (eventual consistency)
- ❌ No history: Can't query "how many snippets did user create last month?"
- **Implementation:** Use `keyGenerator: (c) => user.id` with 30-day window

**Recommended:** Option A (database counter). More accurate and provides better analytics for niche discovery.

### Stripe Integration (Phase 3)
- [ ] Stripe account + API keys
- [ ] Webhook endpoint for subscription events
- [ ] Customer creation on signup
- [ ] Subscription management UI

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
// After user signs up and profile is created
const { data: { user } } = await supabase.auth.getUser();
const { data: profile } = await supabase
  .from('profiles')
  .select('tier, created_at, snippets_this_month')
  .eq('id', user.id)
  .single();

posthog.identify(user.id, {
  email: user.email,
  tier: profile.tier, // 'free' or 'pro'
  signup_date: profile.created_at,
  snippets_created_total: profile.snippets_created_total || 0,
  snippets_this_month: profile.snippets_this_month
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

**Note:** Supabase provides `auth.users` table (private, managed by Supabase Auth). We create a public `profiles` table for application-specific user data.

```sql
-- Create public.profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Subscription info
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,

  -- Quota tracking (for monthly snippet limit)
  snippets_this_month INT NOT NULL DEFAULT 0,
  snippets_created_total INT NOT NULL DEFAULT 0,
  quota_reset_date TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update only their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create index for faster lookups
CREATE INDEX idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);
CREATE INDEX idx_profiles_tier ON public.profiles(tier);

-- Update snippets table to reference profiles
-- Note: snippets.user_id already exists from migration 20250518212657
ALTER TABLE public.snippets
  DROP CONSTRAINT IF EXISTS snippets_user_id_fkey;

ALTER TABLE public.snippets
  ADD CONSTRAINT snippets_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id)
  ON DELETE SET NULL;

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, tier, created_at)
  VALUES (NEW.id, 'free', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when auth.users row is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to reset monthly quota
CREATE OR REPLACE FUNCTION public.reset_monthly_quotas()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET
    snippets_this_month = 0,
    quota_reset_date = NOW() + INTERVAL '1 month'
  WHERE quota_reset_date <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Note: Schedule this function to run daily via Supabase Edge Functions or pg_cron
```

### Migration Plan for Existing Anonymous Snippets

**Current state:** All existing snippets have `user_id = NULL` (anonymous).

**Options:**
1. **Keep as anonymous** - No action needed. When users sign up, only new snippets will have `user_id` set.
2. **Claim via cookie** - If user had a cookie before signup, link their anonymous snippets to new account.

**Recommended:** Option 1 (keep as anonymous). It's simpler and respects zero-knowledge principle - we don't know who created them.

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
