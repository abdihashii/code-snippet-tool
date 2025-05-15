import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeftIcon, ClockIcon, EyeIcon, ShieldIcon } from 'lucide-react';

import { getSnippetById } from '@/api/snippets-api';
import { CodeEditor } from '@/components/snippet/code-editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useSnippetForm } from '@/hooks/use-snippet-form';
import { formatExpiryTimestamp } from '@/lib/utils';

export const Route = createFileRoute('/s/$snippet-id')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const snippetId = params['snippet-id'];
    const snippet = await getSnippetById(snippetId);
    return snippet;
  },
});

function RouteComponent() {
  const {
    content,
    language,
    title,
    expires_at,
    max_views,
    name,
    created_at,
  } = Route.useLoaderData();

  const {
    // Form field states and setters
    code,

    // Derived/Computed values for rendering
    highlightedHtml,
    codeClassName,

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
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-slate-800 dark:text-slate-100">
                  {title || 'Untitled Snippet'}
                </CardTitle>
                <div className="flex space-x-2">
                  <Badge variant="outline" className="flex items-center gap-1 text-xs">
                    <ClockIcon className="h-3 w-3" />
                    Expires:
                    {' '}
                    {formatExpiryTimestamp(expires_at)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 text-xs"
                  >
                    <EyeIcon className="h-3 w-3" />
                    {max_views === 1
                      ? 'Burns after reading'
                      : 'Multiple views'}
                  </Badge>
                </div>
              </div>
              {name && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Shared by:
                  {name}
                </p>
              )}
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Created:
                {' '}
                {created_at}
              </p>
            </CardHeader>

            <CardContent>
              <CodeEditor
                code={code}
                onCodeChange={handleCodeChange} // no-op for read-only editor
                highlightedHtml={highlightedHtml}
                codeClassName={codeClassName}
                MAX_CODE_LENGTH={MAX_CODE_LENGTH}
                isReadOnly={true}
              />
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link to="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-teal-600 text-teal-600 hover:text-teal-700 hover:border-teal-700 hover:cursor-pointer flex items-center justify-center gap-2"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </CardFooter>
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
