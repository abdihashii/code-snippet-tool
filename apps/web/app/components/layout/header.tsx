import { Link } from '@tanstack/react-router';
import { LockIcon } from 'lucide-react';

import { Logo } from '@/components/layout/logo';
import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-card/90 backdrop-blur-[6px]">
      <div className="flex h-full items-center justify-between px-7">
        <div className="flex items-center gap-3.5">
          <Link to="/" aria-label="Home">
            <Logo />
          </Link>
          <span className="hidden sm:block border-l border-border pl-3.5 text-caption text-muted-foreground">
            Share code snippets securely
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-sm bg-success-surface py-1.25 pl-2 pr-2.5 font-mono text-micro text-success-text">
            <LockIcon className="size-micro" strokeWidth={2.5} />
            client-side encrypted
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
