import { Link } from '@tanstack/react-router';
import { MessageSquareIcon } from 'lucide-react';

import { FeedbackDialog } from '@/components/feedback/feedback-dialog';
import { Logo } from '@/components/layout/logo';

/** The spec's single link treatment, shared by Changelog and Feedback. */
const LINK = 'text-caption text-primary-text underline-offset-4 hover:underline';

export function Footer() {
  // Below the shell's one breakpoint only the mark and the copyright survive, which
  // keeps the row on one line at 320px without stacking or shrinking the gutters.
  return (
    <footer className="flex items-center justify-between border-t border-border p-7">
      {/* Same lockup as the header: wordmark, divider, tagline at matching gaps. */}
      <div className="flex items-center gap-3.5">
        <Link to="/" aria-label="Home">
          <Logo size="footer" />
        </Link>
        <span className="hidden sm:block border-l border-border pl-3.5 font-mono text-caption text-muted-foreground">
          no plaintext ever leaves your browser
        </span>
      </div>

      <div className="flex items-center gap-5">
        <Link to="/changelog" className={`hidden sm:block ${LINK}`}>
          Changelog
        </Link>

        <FeedbackDialog
          trigger={(
            <button
              type="button"
              className={`hidden cursor-pointer items-center gap-1.5 sm:inline-flex ${LINK}`}
            >
              <MessageSquareIcon className="size-caption" strokeWidth={2} />
              Feedback
            </button>
          )}
        />

        {/* Brand sits in the same row, so the notice carries only the year. */}
        <span className="text-caption text-muted-foreground">
          ©
          {' '}
          {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}
