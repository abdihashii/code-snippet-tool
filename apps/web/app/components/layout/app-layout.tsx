import React from 'react';

import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';

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

      <Footer />
    </main>
  );
}
