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
import {
  DESCRIPTION,
  KEYWORDS,
  POSTHOG_API_HOST,
  POSTHOG_KEY,
  TITLE,
  URL,
} from '@/lib/constants';
import { ThemeService } from '@/lib/services';

import { NotFound } from './404';

export const Route = createRootRoute({
  head: ({ match }) => {
    // Generate dynamic canonical URL based on current route
    const canonicalUrl = `${URL}${match.pathname}`;

    return {
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
          property: 'og:title',
          content: TITLE,
        },
        {
          property: 'og:description',
          content: DESCRIPTION,
        },
        {
          property: 'og:type',
          content: 'website',
        },
        {
          property: 'og:url',
          content: canonicalUrl,
        },
        {
          property: 'og:image',
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
          content: '/og-image.png',
        },
        {
          name: 'twitter:url',
          content: canonicalUrl,
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
          href: canonicalUrl,
        },
      ],
    };
  },
  component: RootComponent,
  loader: () => ThemeService.getThemeServerFn(),
  notFoundComponent: NotFound,
});

function RootComponent() {
  const data = Route.useLoaderData();

  return (
    <ThemeProvider theme={data}>
      <RootDocument>
        <ErrorBoundary>
          {POSTHOG_KEY && POSTHOG_API_HOST
            ? (
                <PostHogProvider
                  apiKey={POSTHOG_KEY}
                  options={{
                    api_host: POSTHOG_API_HOST,
                    ui_host: 'https://us.posthog.com',
                    // This enables capturing exceptions using Error Tracking
                    capture_exceptions: true,
                    debug: import.meta.env.MODE === 'development',
                  }}
                >
                  <Outlet />
                  <Toaster richColors />
                  <TanStackRouterDevtools />
                </PostHogProvider>
              )
            : (
                <>
                  <Outlet />
                  <Toaster richColors />
                  <TanStackRouterDevtools />
                </>
              )}
        </ErrorBoundary>
      </RootDocument>
    </ThemeProvider>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const { theme } = useTheme();

  return (
    <html lang="en" className={theme} suppressHydrationWarning>
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
