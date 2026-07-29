import { Link } from '@tanstack/react-router';
import { MessageSquareIcon } from 'lucide-react';

import { FeedbackDialog } from '@/components/feedback/feedback-dialog';
import { APP_VERSION } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="mt-auto py-4 text-center text-caption text-muted-foreground">
      <div className="flex items-center justify-center gap-3">
        <span>
          ©
          {' '}
          {new Date().getFullYear()}
          {' '}
          Secure Snippet Share
        </span>
        <span>|</span>
        <Link
          to="/changelog"
          className="hover:text-primary transition-colors underline-offset-4 hover:underline"
        >
          v
          {APP_VERSION}
        </Link>
        <span>|</span>
        <FeedbackDialog
          trigger={(
            <button
              type="button"
              className="hover:cursor-pointer inline-flex items-center gap-1 hover:text-primary transition-colors underline-offset-4 hover:underline"
            >
              <MessageSquareIcon className="h-3 w-3" />
              Feedback
            </button>
          )}
        />
      </div>
    </footer>
  );
}
