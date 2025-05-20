import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { Header } from '@/components/layout/header';
import { LinkDisplay } from '@/components/snippet/link-display';
import { SnippetForm } from '@/components/snippet/snippet-form';

export const Route = createFileRoute('/new/')({
  component: RouteComponent,
});

function RouteComponent() {
  const [currentState, setCurrentState] = useState<'form' | 'link'>('form');
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [snippetPasswordWasSet, setSnippetPasswordWasSet] = useState<boolean>(false);

  const handleSnippetCreated = (
    result: { link: string; passwordWasSet: boolean }) => {
    setGeneratedLink(result.link);
    setSnippetPasswordWasSet(result.passwordWasSet);
    setCurrentState('link');
  };

  const handleCreateAnother = () => {
    setCurrentState('form');
    setGeneratedLink('');
    setSnippetPasswordWasSet(false);
  };

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-start p-4 sm:p-6 md:p-8 bg-slate-50"
    >
      <div className="w-full max-w-3xl mx-auto">
        <Header />

        <div className="transition-all duration-300 ease-in-out">
          {currentState === 'form'
            ? (
                <SnippetForm onSnippetCreated={handleSnippetCreated} />
              )
            : (
                <LinkDisplay
                  link={generatedLink}
                  onCreateAnother={handleCreateAnother}
                  passwordWasSet={snippetPasswordWasSet}
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
