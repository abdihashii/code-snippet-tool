import { usePostHog } from 'posthog-js/react';
import { useEffect, useRef } from 'react';

interface ScrollMilestone {
  percentage: number;
  label: string;
  fired: boolean;
}

export function useLandingAnalytics() {
  const posthog = usePostHog();
  const startTime = useRef<number>(Date.now());
  const scrollMilestones = useRef<ScrollMilestone[]>([
    { percentage: 25, label: 'scroll_25', fired: false },
    { percentage: 50, label: 'scroll_50', fired: false },
    { percentage: 75, label: 'scroll_75', fired: false },
    { percentage: 100, label: 'scroll_100', fired: false },
  ]);
  const interactionTracked = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Track landing page view
    posthog.capture('landing_page_view', {
      referrer: document.referrer,
      utm_source: new URLSearchParams(window.location.search).get('utm_source'),
      utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
      utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
    });

    // Track time on page
    const trackTimeOnPage = () => {
      const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
      posthog.capture('landing_page_time_spent', {
        seconds: timeSpent,
        engagement_level: getEngagementLevel(timeSpent),
      });
    };

    // Track scroll depth
    const trackScrollDepth = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPosition = window.scrollY;
      const scrollPercentage = Math.round((scrollPosition / scrollHeight) * 100);

      // Check and fire milestone events
      scrollMilestones.current.forEach((milestone) => {
        if (!milestone.fired && scrollPercentage >= milestone.percentage) {
          milestone.fired = true;
          posthog.capture('landing_scroll_milestone', {
            milestone: milestone.label,
            percentage: milestone.percentage,
            time_to_milestone: Math.floor((Date.now() - startTime.current) / 1000),
          });
        }
      });
    };

    // Add scroll listener
    const handleScroll = debounce(trackScrollDepth, 200);
    window.addEventListener('scroll', handleScroll);

    // Track before user leaves
    const handleBeforeUnload = () => {
      trackTimeOnPage();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      trackTimeOnPage();
    };
  }, [posthog]);

  // Track section visibility
  const trackSectionView = (sectionName: string) => {
    if (!interactionTracked.current.has(sectionName)) {
      interactionTracked.current.add(sectionName);
      posthog.capture('landing_section_view', {
        section: sectionName,
        time_to_view: Math.floor((Date.now() - startTime.current) / 1000),
      });
    }
  };

  // Track conversion funnel steps
  const trackFunnelStep = (step: string, metadata?: Record<string, any>) => {
    const funnelSteps = {
      view_landing: 1,
      view_demo: 2,
      interact_demo: 3,
      click_cta: 4,
      navigate_to_new: 5,
      create_snippet: 6,
    };

    posthog.capture('conversion_funnel', {
      step,
      step_number: funnelSteps[step as keyof typeof funnelSteps] || 0,
      time_since_landing: Math.floor((Date.now() - startTime.current) / 1000),
      ...metadata,
    });
  };

  // Track feature interest
  const trackFeatureInterest = (feature: string, action: string) => {
    posthog.capture('feature_interest', {
      feature,
      action,
      time_on_page: Math.floor((Date.now() - startTime.current) / 1000),
    });
  };

  return {
    trackSectionView,
    trackFunnelStep,
    trackFeatureInterest,
  };
}

// Helper functions
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

function getEngagementLevel(seconds: number): string {
  if (seconds < 10) return 'bounce';
  if (seconds < 30) return 'low';
  if (seconds < 60) return 'medium';
  if (seconds < 180) return 'high';
  return 'very_high';
}
