import { useEffect, useState } from 'react';

/**
 * Hook that cycles through placeholder texts with fade animation
 * @param texts Array of placeholder texts to cycle through
 * @param isActive Whether the cycling should be active
 * @returns Current text and visibility state for fade animation
 */
export function usePlaceholderCycle(texts: string[], isActive: boolean) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!isActive) return;

    let timeout: NodeJS.Timeout | undefined;
    const interval = setInterval(() => {
      // Fade out
      setIsVisible(false);

      // After fade out, change text and fade in
      timeout = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % texts.length);
        setIsVisible(true);
      }, 200); // Quick fade duration
    }, 3000); // Show each text for 3 seconds

    return () => {
      clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [texts, isActive]);

  return {
    text: texts[currentIndex] || texts[0],
    isVisible,
  };
}
