- [x] Encrypt the code before storing it
- [x] Snippet shared page
- [ ] Add proper file extensions based on language for download functionality

Critical Priority

- [x] Copy to Clipboard Functionality - The snippet view page shows decrypted code but lacks copy
      functionality (referenced in PRD FR4.5)
- [x] Download Snippet Feature - Missing download capability for decrypted content (PRD FR4.6)
- [x] Error Boundaries & Better Error Handling - No React error boundaries for graceful failure
      handling
- [ ] Rate Limiting - No protection against abuse for snippet creation/viewing
- [x] CSRF Protection - Missing CSRF tokens for state-changing operations

High Priority

- [ ] Content Security Policy (CSP) - No CSP headers implemented for XSS protection (PRD NFR1.8)
- [ ] Input Validation & Sanitization - Limited server-side validation on snippet creation
- [ ] Proper Logging & Monitoring - Basic console.error but no structured logging/alerting
- [x] Database Connection Pooling - No connection management for Supabase client
- [x] Password Strength Validation - Password protection exists but no strength requirements

Medium Priority

- [ ] Progressive Enhancement - No fallbacks for JavaScript-disabled browsers
- [ ] Better Mobile Experience - Basic responsive design but could be improved
- [ ] Accessibility (a11y) - Missing ARIA labels, keyboard navigation, screen reader support
- [ ] Performance Optimizations - No code splitting, lazy loading, or caching strategies
- [ ] SEO & Discoverability Improvements:
  - [x] Basic meta tags (title, description, OG, Twitter cards)
  - [x] robots.txt file
  - [x] sitemap.xml file
  - [x] llms.txt file for AI discoverability
  - [ ] Create social media images (og-image.png, twitter-image.png) - 1200x630px
  - [ ] Add JSON-LD structured data for SoftwareApplication schema
  - [ ] Create manifest.json for PWA features
  - [ ] Add security.txt file
  - [ ] Consider humans.txt file (optional)

Low Priority

- [ ] Internationalization (i18n) - English-only interface
- [x] Dark Mode - Not implemented despite UI components supporting it
- [ ] Analytics/Telemetry - No usage tracking (though this aligns with privacy-first approach)

The most critical gaps are copy/download functionality and security hardening (CSP, rate limiting,
CSRF). These should be addressed before any production deployment.
