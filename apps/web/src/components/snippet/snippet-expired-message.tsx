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
      <ShieldAlertIcon className="h-12 w-12 mx-auto mb-4 text-orange-500" />
      <h2 className="text-xl font-semibold text-slate-700 mb-2">
        {title}
      </h2>
      <p className="text-slate-600 mb-6">
        {message}
      </p>
      {showGoHomeButton && (
        <Link to="/">
          <Button
            variant="outline"
            size="sm"
            className="border-teal-600 text-teal-600 hover:text-teal-700 hover:border-teal-700 flex items-center gap-2 mx-auto"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      )}
    </div>
  );
}
