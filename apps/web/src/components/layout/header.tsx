import { Link } from '@tanstack/react-router';
import { ShieldIcon } from 'lucide-react';

export function Header() {
  return (
    <header
      className="flex items-center flex-col justify-center mb-6 mt-4"
    >
      <Link to="/" className="flex items-center justify-center">
        <ShieldIcon className="h-6 w-6 mr-2 text-teal-600" />
        <h1
          className="text-2xl font-semibold text-slate-800"
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
