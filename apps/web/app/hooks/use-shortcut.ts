import { useEffect, useRef } from 'react';

import {
  isApplePlatform,
  isEditableTarget,
  matchesShortcut,
  parseShortcut,
} from '@/lib/utils/shortcut-utils';

export function useShortcut(
  shortcut: string,
  command: (event: KeyboardEvent) => void,
  enabled = true,
) {
  const commandRef = useRef(command);

  useEffect(() => {
    commandRef.current = command;
  }, [command]);

  useEffect(() => {
    if (!enabled) return;

    const parsedShortcut = parseShortcut(shortcut);
    const applePlatform = isApplePlatform();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.repeat
        || isEditableTarget(event.target)
        || !matchesShortcut(event, parsedShortcut, applePlatform)
      ) {
        return;
      }

      event.preventDefault();
      commandRef.current(event);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, shortcut]);
}
