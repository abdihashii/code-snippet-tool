import { Link } from '@tanstack/react-router';
import { ArrowLeftIcon, ShieldAlertIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface SnippetExpiredMessageProps {
  title?: string;
  message?: string;
  showGoHomeButton?: boolean;
  containerClassName?: string;
}

export function SnippetExpiredMessage({
  title = 'Snippet Expired',
  message = 'This snippet is no longer available.',
  showGoHomeButton = false,
  containerClassName = 'text-center py-8',
}: SnippetExpiredMessageProps) {
  return (
    <div className={containerClassName}>
      <ShieldAlertIcon className="h-12 w-12 mx-auto mb-4 text-warning" />
      <h2 className="text-xl font-semibold text-foreground mb-2">
        {title}
      </h2>
      <p className="text-muted-foreground mb-6">
        {message}
      </p>
      {showGoHomeButton && (
        <Link to="/">
          <Button
            variant="outline"
            size="sm"
            className="border-primary text-primary hover:text-primary/90 hover:border-primary/90 flex items-center gap-2 mx-auto"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Home
          </Button>
        </Link>
      )}
    </div>
  );
}
