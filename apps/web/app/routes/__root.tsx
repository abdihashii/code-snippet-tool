import type { ReactNode } from 'react';

import { ErrorBoundary } from '@/components/error-boundary';
import { ThemeProvider, useTheme } from '@/components/theme-provider';
import { getThemeServerFn } from '@/lib/theme';
import appCss from '@/styles/app.css?url';
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { PostHogProvider } from 'posthog-js/react';
import { Toaster } from 'sonner';

import { NotFound } from './404';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  component: RootComponent,
  loader: () => getThemeServerFn(),
  notFoundComponent: NotFound,
});

function RootComponent() {
  const data = Route.useLoaderData();

  return (
    <ThemeProvider theme={data}>
    <RootDocument>
      <ErrorBoundary>
        <PostHogProvider
          apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
          options={{
            api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
            capture_exceptions: true, // This enables capturing exceptions using Error Tracking
            debug: import.meta.env.MODE === 'development',
          }}
        >
        <Outlet />
        <Toaster richColors />
        <TanStackRouterDevtools />
        </PostHogProvider>
      </ErrorBoundary>
    </RootDocument>
    </ThemeProvider>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const { theme } = useTheme();

  return (
    <html className={theme} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <main>
          {children}
        </main>
        <Scripts />
      </body>
    </html>
  );
}
