import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Toaster } from 'sonner';

import { ErrorBoundary } from '@/components/error-boundary';

export const Route = createRootRoute({
  component: () => (
    <ErrorBoundary>
      <Outlet />
      <Toaster richColors />
      <TanStackRouterDevtools />
    </ErrorBoundary>
  ),
});
