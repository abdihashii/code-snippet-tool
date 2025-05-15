import { createFileRoute, Link } from '@tanstack/react-router';
import { ShieldIcon, Wand2Icon } from 'lucide-react';

import { getSnippetById } from '@/api/snippets-api';
import { CodeEditor } from '@/components/snippet/code-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSnippetForm } from '@/hooks/use-snippet-form';

export const Route = createFileRoute('/s/$snippet-id')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const snippetId = params['snippet-id'];
    const snippet = await getSnippetById(snippetId);
    return snippet;
  },
});

function RouteComponent() {
  const { content, language } = Route.useLoaderData();

  const {
    // Form field states and setters
    code,

    // Derived/Computed values for rendering
    highlightedHtml,
    codeClassName,
    canPrettifyCurrentLanguage,

    // Actions
    prettifyCode,

    // Status
    isPrettifying,

    // Constants
    MAX_CODE_LENGTH,
  } = useSnippetForm({ initialCode: content, initialLanguage: language });

  // Dummy onCodeChange for read-only editor
  const handleCodeChange = () => {};

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-start p-4 sm:p-6 md:p-8 bg-slate-50"
    >
      <div className="w-full max-w-3xl mx-auto">
        <header className="mb-6 mt-4">
          <Link to="/" className="flex items-center justify-center">
            <ShieldIcon className="h-6 w-6 mr-2 text-teal-600" />
            <h1
              className="text-2xl font-semibold text-slate-800"
            >
              Secure Snippet Sharer
            </h1>
          </Link>
        </header>

        <p
          className="text-center text-slate-600 mb-8"
        >
          Share code snippets securely and simply
        </p>

        <div className="transition-all duration-300 ease-in-out">
          <Card className="w-full shadow-md border-slate-200 bg-white">
            <CardContent className="py-6 flex flex-col gap-4">
              <CodeEditor
                code={code}
                onCodeChange={handleCodeChange} // no-op for read-only editor
                highlightedHtml={highlightedHtml}
                codeClassName={codeClassName}
                MAX_CODE_LENGTH={MAX_CODE_LENGTH}
                isReadOnly={true}
              />

              {/* Prettify button */}
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-fit">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={prettifyCode}
                        disabled={isPrettifying || (!code.trim()) || !canPrettifyCurrentLanguage}
                        className="border-teal-600 text-teal-600 hover:text-teal-700 hover:border-teal-700 hover:cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Wand2Icon className="h-4 w-4" />
                        {isPrettifying ? 'Prettifying...' : 'Prettify Code'}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {code === ''
                      ? 'Paste your code to start prettifying'
                      : canPrettifyCurrentLanguage
                        ? 'Prettify code for the current language'
                        : 'Cannot prettify code for the current language'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardContent>
          </Card>
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
