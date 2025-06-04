import { Link } from '@tanstack/react-router';
import { ShieldIcon } from 'lucide-react';

import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  return (
    <header
      className="flex items-center flex-col justify-center mb-6 mt-4 relative"
    >
      <div className="absolute top-0 right-0">
        <ThemeToggle />
      </div>
      <Link to="/" className="flex items-center justify-center">
        <ShieldIcon className="h-6 w-6 mr-2 text-primary" />
        <h1
          className="text-2xl font-semibold text-foreground"
        >
          Secure Snippet Sharer
        </h1>
      </Link>
      <p
        className="text-center text-muted-foreground mb-8"
      >
        Share code snippets securely and simply
      </p>
    </header>
  );
}
