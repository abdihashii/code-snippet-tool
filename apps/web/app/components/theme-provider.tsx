import type { PropsWithChildren } from 'react';

import { setThemeServerFn } from '@/lib/theme';
import { useRouter } from '@tanstack/react-router';
import { createContext, use } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextVal { theme: Theme; setTheme: (val: Theme) => void }
type Props = PropsWithChildren<{ theme: Theme }>;

const ThemeContext = createContext<ThemeContextVal | null>(null);

export function ThemeProvider({ children, theme }: Props) {
  const router = useRouter();

  function setTheme(val: Theme) {
    setThemeServerFn({ data: val });
    router.invalidate();
  }

  return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>;
}

export function useTheme() {
  const val = use(ThemeContext);
  if (!val) throw new Error('useTheme called outside of ThemeProvider!');
  return val;
}
