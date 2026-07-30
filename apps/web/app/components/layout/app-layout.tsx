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

      {/* Column direction so a centered PageContainer can claim the height. */}
      <div className="flex flex-1 flex-col">
        {children}
      </div>

      <Footer />
    </main>
  );
}
