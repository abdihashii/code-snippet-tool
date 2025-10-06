import type { PropsWithChildren } from 'react';

import { useRouter } from '@tanstack/react-router';
import { useCallback, useMemo } from 'react';

import type { Theme } from '@/hooks/use-theme';

import { ThemeContext } from '@/hooks/use-theme';
import { ThemeService } from '@/lib/services';

type Props = PropsWithChildren<{ theme: Theme }>;

export function ThemeProvider({ children, theme }: Props) {
  const router = useRouter();

  const setTheme = useCallback(async (val: Theme) => {
    await ThemeService.setThemeServerFn({ data: val });
    router.invalidate();
  }, [router]);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
