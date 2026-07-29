/* eslint-disable react-refresh/only-export-components -- Storybook harness module, not part of the app's HMR graph. */
import type { Decorator } from '@storybook/react-vite';
import type { ComponentType } from 'react';

import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { useMemo } from 'react';

import type { Theme } from '@/hooks/use-theme';

import { ThemeContext } from '@/hooks/use-theme';

function RouterHarness({ Story }: { Story: ComponentType }) {
  const router = useMemo(() => {
    const rootRoute = createRootRoute({ component: () => <Story /> });

    return createRouter({
      routeTree: rootRoute.addChildren([
        createRoute({ getParentRoute: () => rootRoute, path: '/' }),
        createRoute({ getParentRoute: () => rootRoute, path: '/changelog' }),
      ]),
      history: createMemoryHistory({ initialEntries: ['/'] }),
    });
  }, [Story]);

  // The app's `Register` declaration pins RouterProvider to the real router.
  return <RouterProvider router={router as never} />;
}

function ThemeHarness({ Story, theme }: { Story: ComponentType; theme: Theme }) {
  const value = useMemo(() => ({ theme, setTheme: () => {} }), [theme]);

  return (
    <ThemeContext value={value}>
      <Story />
    </ThemeContext>
  );
}

/**
 * Shell components navigate with `<Link>`, which needs a router in scope. The
 * app router can't serve here: it pulls in the generated route tree and its
 * server-side loaders. This builds a throwaway router whose root renders the
 * story, with the shell's link targets registered so `<Link>` resolves them.
 */
export const withRouter: Decorator = (Story) => <RouterHarness Story={Story} />;

/**
 * `ThemeToggle` calls `useTheme`, which throws outside a `ThemeContext`.
 * `ThemeProvider` can't supply it here — it calls `useRouter` and persists
 * through a server fn. Reading the addon-themes global instead keeps the
 * toggle's reported theme in step with the class the addon applies.
 */
export const withTheme: Decorator = (Story, context) => (
  <ThemeHarness Story={Story} theme={context.globals.theme === 'dark' ? 'dark' : 'light'} />
);
