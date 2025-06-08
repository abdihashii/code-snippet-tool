import { createRouter, RouterProvider } from '@tanstack/react-router';
import { PostHogProvider } from 'posthog-js/react';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import { ThemeProvider } from './components/theme-provider';
import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <PostHogProvider
        apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
        options={{
          api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
          capture_exceptions: true, // This enables capturing exceptions using Error Tracking
          debug: import.meta.env.MODE === 'development',
        }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <RouterProvider router={router} />
        </ThemeProvider>
      </PostHogProvider>
    </StrictMode>,
  );
}
