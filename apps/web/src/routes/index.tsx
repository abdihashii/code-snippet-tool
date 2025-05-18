import { createFileRoute, Link } from '@tanstack/react-router';

import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-start p-4 sm:p-6 md:p-8 bg-slate-50"
    >
      <div className="w-full max-w-3xl mx-auto">
        <Header />

        <div className="flex flex-col items-center justify-center">
          <p className="text-center text-muted-foreground mb-8">
            Share code snippets securely and simply
          </p>
          <Link to="/new">
            <Button
              variant="outline"
              className="border-teal-600 text-teal-600 hover:text-teal-700 hover:border-teal-700 hover:cursor-pointer flex items-center justify-center gap-2"
            >
              Start Sharing
            </Button>
          </Link>
        </div>
      </div>

      <footer className="mt-auto py-4 text-center text-sm text-slate-500">
        ©
        {' '}
        {new Date().getFullYear()}
        {' '}
        Secure Snippet Sharer
      </footer>
    </main>
  );
}
