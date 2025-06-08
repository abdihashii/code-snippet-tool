import React from 'react';

import { Header } from '@/components/layout/header';

export function AppLayout({ children }: {
  children: React.ReactNode;
}) {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-start p-4 sm:p-6 md:p-8 bg-background"
    >
      <div className="w-full max-w-5xl mx-auto">
        <Header />

        {children}
      </div>

      <footer className="mt-auto py-4 text-center text-sm text-muted-foreground">
        ©
        {' '}
        {new Date().getFullYear()}
        {' '}
        Secure Snippet Share
      </footer>
    </main>
  );
}
