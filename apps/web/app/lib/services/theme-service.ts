import { createServerFn } from '@tanstack/react-start';
import { getCookie, setCookie } from '@tanstack/react-start/server';

import type { Theme } from '@/hooks/use-theme';

const storageKey = 'ui-theme';

// Pure function - no server APIs, fully testable
export function getThemeFromCookieValue(cookieValue: string | null | undefined): Theme {
  return (cookieValue || 'dark') as Theme;
}

// Pure function - no server APIs, fully testable
export function validateTheme(data: unknown): Theme {
  if (typeof data !== 'string' || (data !== 'dark' && data !== 'light')) {
    throw new Error('Invalid theme provided');
  }
  return data as Theme;
}

// Server functions use the pure logic internally
/* c8 ignore next 4 */
export const getThemeServerFn = createServerFn().handler(async () => {
  const cookieValue = getCookie(storageKey);
  return getThemeFromCookieValue(cookieValue);
});

/* c8 ignore next 7 */
export const setThemeServerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => {
    return validateTheme(data);
  })
  .handler(async ({ data }) => {
    setCookie(storageKey, data);
  });
