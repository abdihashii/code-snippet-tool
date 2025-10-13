import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/404')({
  component: NotFound,
});

export function NotFound() {
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 min-h-[calc(100vh-16rem)] flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            404 - Page Not Found
          </h1>
          <p className="text-lg text-muted-foreground">
            The page you are looking for does not exist.
          </p>
          <div className="flex justify-center pt-4">
            <Button asChild size="lg">
              <Link to="/">
                <ArrowLeftIcon />
                {' '}
                Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
