import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';

import { AppLayout } from '@/components/layout/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/404')({
  component: NotFound,
});

export function NotFound() {
  return (
    <AppLayout>
      <PageContainer width="focus" centered>
        <div className="text-center space-y-6">
          <h1 className="text-card-title tracking-tight">
            404 - Page Not Found
          </h1>
          <p className="text-body text-muted-foreground">
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
      </PageContainer>
    </AppLayout>
  );
}
