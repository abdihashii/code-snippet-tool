import { useEffect, useState } from 'react';

const STORAGE_KEY = 'announcement-banner-dismissed';

export function useAnnouncementBanner() {
  const [isDismissed, setIsDismissed] = useState(true); // Default to true for SSR

  useEffect(() => {
    // Check localStorage on mount (client-side only)
    const dismissed = localStorage.getItem(STORAGE_KEY) === 'true';
    setIsDismissed(dismissed);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsDismissed(true);
  };

  return { isDismissed, dismiss };
}
