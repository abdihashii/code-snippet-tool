import React from 'react';

import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';

export function AppLayout({ children }: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen flex-col bg-background"
    >
      <Header />

      {/* Column so a centered PageContainer can fill the height. */}
      <main className="flex flex-1 flex-col">
        {children}
      </main>

      <Footer />
    </div>
  );
}
