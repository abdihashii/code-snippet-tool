import { createFileRoute } from '@tanstack/react-router';
import { ShieldIcon } from 'lucide-react';
import { useState } from 'react';

import { LinkDisplay } from '@/components/snippet/link-display';
import { SnippetForm } from '@/components/snippet/snippet-form';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const [currentState, setCurrentState] = useState<'form' | 'link'>('form');
  const [generatedLink, setGeneratedLink] = useState<string>('');

  const handleSnippetCreated = (link: string) => {
    setGeneratedLink(link);
    setCurrentState('link');
  };

  const handleCreateAnother = () => {
    setCurrentState('form');
  };

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-start p-4 sm:p-6 md:p-8 bg-slate-50"
    >
      <div className="w-full max-w-3xl mx-auto">
        <header className="flex items-center justify-center mb-6 mt-4">
          <ShieldIcon className="h-6 w-6 mr-2 text-teal-600" />
          <h1
            className="text-2xl font-semibold text-slate-800"
          >
            Secure Snippet Sharer
          </h1>
        </header>

        <p
          className="text-center text-slate-600 mb-8"
        >
          Share code snippets securely and simply
        </p>

        <div className="transition-all duration-300 ease-in-out">
          {currentState === 'form'
            ? (
                <SnippetForm onSnippetCreated={handleSnippetCreated} />
              )
            : (
                <LinkDisplay
                  link={generatedLink}
                  onCreateAnother={handleCreateAnother}
                />
              )}
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
