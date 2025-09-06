import { Link } from '@tanstack/react-router';
import { ShieldIcon } from 'lucide-react';

import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  return (
    <header className="w-full border-b border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/" className="flex items-center gap-2">
              <ShieldIcon className="h-5 w-5 text-primary" />
              <h1 className="text-lg sm:text-xl font-bold text-foreground">
                Secure Snippet Share
              </h1>
            </Link>
            <span className="hidden sm:inline text-sm text-muted-foreground">
              Share code snippets securely
            </span>
          </div>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
