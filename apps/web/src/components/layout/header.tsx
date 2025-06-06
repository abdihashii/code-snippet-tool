import { Link } from '@tanstack/react-router';
import { ShieldIcon } from 'lucide-react';

import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  return (
    <header className="w-full mb-8 mt-6">
      <div className="flex flex-col justify-center items-center space-y-6">
        <div className="flex flex-col items-center">
          <Link to="/" className="flex items-center justify-center mb-3">
            <ShieldIcon className="h-7 w-7 mr-3 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              Secure Snippet Sharer
            </h1>
          </Link>
          <p className="text-center text-muted-foreground text-lg">
            Share code snippets securely and simply
          </p>
        </div>

        <div className="flex justify-end">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
