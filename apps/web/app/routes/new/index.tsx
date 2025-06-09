import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { AppLayout } from '@/components/layout/app-layout';
import { LinkDisplay } from '@/components/snippet/link-display';
import { SnippetForm } from '@/components/snippet/snippet-form';

export const Route = createFileRoute('/new/')({
  component: RouteComponent,
});

function RouteComponent() {
  const [currentState, setCurrentState] = useState<'form' | 'link'>('form');
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [snippetPasswordWasSet, setSnippetPasswordWasSet]
  = useState<boolean>(false);

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
    <AppLayout>
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
    </AppLayout>
  );
}
