import { createServerFn } from '@tanstack/react-start';
import { getCookie, setCookie } from '@tanstack/react-start/server';

import type { Theme } from '@/hooks/use-theme';

const storageKey = 'ui-theme';

export function getThemeFromCookie(): Theme {
  return (getCookie(storageKey) || 'light') as Theme;
}

export function validateTheme(data: unknown): Theme {
  if (typeof data !== 'string' || (data !== 'dark' && data !== 'light')) {
    throw new Error('Invalid theme provided');
  }
  return data as Theme;
}

export function setThemeCookie(theme: Theme): void {
  setCookie(storageKey, theme);
}

/* c8 ignore next 3 */
export const getThemeServerFn = createServerFn().handler(async () => {
  return getThemeFromCookie();
});

/* c8 ignore next 7 */
export const setThemeServerFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    return validateTheme(data);
  })
  .handler(async ({ data }) => {
    setThemeCookie(data);
  });
