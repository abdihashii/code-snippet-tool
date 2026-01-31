import { usePostHog } from 'posthog-js/react';
import { useCallback } from 'react';

/**
 * Focused product analytics hook for tracking critical user actions and events.
 * Only tracks the most important metrics for understanding product usage.
 */
export function useProductAnalytics() {
  const posthog = usePostHog();

  /**
   * Track when a snippet is successfully created
   */
  const trackSnippetCreated = useCallback((metadata?: {
    passwordProtected?: boolean;
    expiresAfter?: string;
    maxViews?: string;
  }) => {
    posthog.capture('snippet_created', metadata);
  }, [posthog]);

  /**
   * Track when a snippet is viewed (page loaded successfully)
   */
  const trackSnippetViewed = useCallback((metadata?: {
    isPasswordProtected?: boolean;
  }) => {
    posthog.capture('snippet_viewed', metadata);
  }, [posthog]);

  /**
   * Track when a password-protected snippet is successfully decrypted
   */
  const trackSnippetDecrypted = useCallback(() => {
    posthog.capture('snippet_decrypted');
  }, [posthog]);

  /**
   * Track when a snippet link is copied to clipboard
   */
  const trackLinkCopied = useCallback((metadata?: {
    source?: 'creation' | 'link_display' | 'other';
  }) => {
    posthog.capture('snippet_link_copied', metadata);
  }, [posthog]);

  /**
   * Track when code is copied from a snippet view
   */
  const trackCodeCopied = useCallback(() => {
    posthog.capture('snippet_code_copied');
  }, [posthog]);

  /**
   * Track when a snippet is downloaded
   */
  const trackSnippetDownloaded = useCallback((metadata?: {
    language?: string;
  }) => {
    posthog.capture('snippet_downloaded', metadata);
  }, [posthog]);

  /**
   * Track when snippet decryption fails
   */
  const trackDecryptionFailed = useCallback((metadata?: {
    reason?: 'wrong_password' | 'invalid_key' | 'corrupted_data' | 'unknown';
    isPasswordProtected?: boolean;
  }) => {
    posthog.capture('decryption_failed', metadata);
  }, [posthog]);

  /**
   * Track when a user hits a rate limit
   */
  const trackRateLimitHit = useCallback((metadata?: {
    endpoint?: string;
    limit?: number;
    remaining?: number;
  }) => {
    posthog.capture('rate_limit_hit', metadata);
  }, [posthog]);

  /**
   * Track when a CTA element is displayed to a snippet viewer
   */
  const trackCtaImpression = useCallback((metadata: {
    location: 'card_footer' | 'code_toolbar' | 'post_action_toast';
  }) => {
    posthog.capture('cta_impression', metadata);
  }, [posthog]);

  /**
   * Track when a snippet viewer clicks a CTA element
   */
  const trackCtaClicked = useCallback((metadata: {
    location: 'card_footer' | 'code_toolbar' | 'post_action_toast';
    type: 'create_snippet' | 'home';
  }) => {
    posthog.capture('cta_clicked', metadata);
  }, [posthog]);

  return {
    trackSnippetCreated,
    trackSnippetViewed,
    trackSnippetDecrypted,
    trackLinkCopied,
    trackCodeCopied,
    trackSnippetDownloaded,
    trackDecryptionFailed,
    trackRateLimitHit,
    trackCtaImpression,
    trackCtaClicked,
  };
}
