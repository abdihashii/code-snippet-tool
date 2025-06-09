import { ClientOnly, createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { AppLayout } from '@/components/layout/app-layout';
import { LinkDisplay } from '@/components/snippet/link-display';
import { SnippetForm } from '@/components/snippet/snippet-form';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function LoadingFallback() {
  return (
    <AppLayout>
      <Card className="w-full shadow-md">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Tabs skeleton - matches the actual TabsList structure */}
            <div className="w-full">
              <div className="grid w-full grid-cols-2 h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
                <Skeleton className="h-8 rounded-sm" />
                <Skeleton className="h-8 rounded-sm" />
              </div>
              
              {/* Code editor area - matches TabsContent */}
              <div className="mt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16" /> {/* Language label */}
                    <Skeleton className="h-10 w-32" /> {/* Language select */}
                  </div>
                  <Skeleton className="h-[200px] w-full rounded-md" /> {/* Code editor */}
                </div>
              </div>
            </div>

            {/* Prettify button and character count - matches the actual layout */}
            <div className="flex justify-between items-center gap-4 text-right text-sm text-muted-foreground">
              <Skeleton className="h-9 w-36" /> {/* Prettify button */}
              <Skeleton className="h-4 w-40" /> {/* Character count */}
            </div>

            {/* Expires After and Max Views - matches grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            {/* Optional Settings collapsible trigger */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" /> {/* Chevron icon */}
              <Skeleton className="h-4 w-28" /> {/* "Optional Settings" text */}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center p-6 pt-0">
          <Skeleton className="h-11 w-full sm:w-48" />
        </CardFooter>
      </Card>
    </AppLayout>
  );
}

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
    <ClientOnly fallback={<LoadingFallback />}>
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
    </ClientOnly>
  );
}
