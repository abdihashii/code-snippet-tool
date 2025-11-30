import { Link } from '@tanstack/react-router';
import { LogOutIcon, ShieldIcon, UserIcon } from 'lucide-react';

import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export function Header() {
  const { user, isAuthenticated, isSessionLoading, signOut } = useAuth();

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

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {!isSessionLoading && (
              isAuthenticated
                ? (
                    <div className="flex items-center gap-2">
                      <span className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
                        <UserIcon className="h-3 w-3" />
                        {user?.email}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => signOut()}
                        className="flex items-center gap-1"
                      >
                        <LogOutIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Sign Out</span>
                      </Button>
                    </div>
                  )
                : (
                    <Link to="/login" search={{ error: undefined, callbackUrl: undefined }}>
                      <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                        Sign In
                      </Button>
                    </Link>
                  )
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
