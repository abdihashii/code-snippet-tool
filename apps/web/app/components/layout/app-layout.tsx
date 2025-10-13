import { Link } from '@tanstack/react-router';
import React from 'react';

import { Header } from '@/components/layout/header';
import { CURRENT_VERSION } from '@/routes/changelog';

export function AppLayout({ children }: {
  children: React.ReactNode;
}) {
  return (
    <main
      className="flex min-h-screen flex-col bg-background"
    >
      <Header />

      <div className="flex-1">
        {children}
      </div>

      <footer className="mt-auto py-4 text-center text-sm text-muted-foreground">
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
            {CURRENT_VERSION}
          </Link>
        </div>
      </footer>
    </main>
  );
}
