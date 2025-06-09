import type { ReactNode } from 'react';

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

import { ErrorBoundary } from '@/components/error-boundary';
import { ThemeProvider } from '@/components/theme-provider';
import { useTheme } from '@/hooks/use-theme';
import { getThemeServerFn } from '@/lib/theme';

import { NotFound } from './404';

const TITLE = 'Snippet Share - Securely Share Code Snippets';
const DESCRIPTION
= 'A secure and easy way to share code snippets with others. Create self-destructing, password-protected snippets with end-to-end encryption.';
const KEYWORDS = 'snippet, share, code, developer, tools, secure, encrypted, self-destructing';
const URL = 'https://snippet-share.com';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      // General Tags
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },

      // SEO Tags
      {
        title: TITLE,
      },
      {
        name: 'description',
        content: DESCRIPTION,
      },
      {
        name: 'keywords',
        content: KEYWORDS,
      },

      // Open Graph Tags (for social sharing)
      {
        name: 'og:title',
        content: TITLE,
      },
      {
        name: 'og:description',
        content: DESCRIPTION,
      },
      {
        name: 'og:type',
        content: 'website',
      },
      {
        name: 'og:url',
        content: URL,
      },
      {
        name: 'og:image',
        content: `${URL}/og-image.png`,
      },

      // Twitter Tags (for Twitter sharing)
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: TITLE,
      },
      {
        name: 'twitter:description',
        content: DESCRIPTION,
      },
      {
        name: 'twitter:image',
        content: `${URL}/og-image.png`,
      },
      {
        name: 'twitter:url',
        content: URL,
      },
    ],
    links: [
      {
        rel: 'icon',
        href: '/favicon.svg',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'canonical',
        href: URL,
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
