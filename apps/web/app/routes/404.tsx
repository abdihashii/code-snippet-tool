import { createFileRoute, Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/404')({
  component: NotFound,
});

export function NotFound() {
  return (
    <div className="flex flex-col gap-2">
      <h1>404 - Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Button asChild>
        <Link to="/">Go to Home</Link>
      </Button>
    </div>
  );
}
