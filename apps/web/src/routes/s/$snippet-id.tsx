import type { GetSnippetByIdResponse, Language } from '@snippet-share/types';

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
import { formatExpiryTimestamp, hasExpiredByTime } from '@/lib/utils';

// Define an interface for the API error response structure
interface ApiErrorResponse {
  error: string;
  message: string;
}

export const Route = createFileRoute('/s/$snippet-id')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const snippetId = params['snippet-id'];
    // The return type of getSnippetById needs to accommodate ApiErrorResponse
    const snippet = await getSnippetById(snippetId);
    // APIErrorResponse is casted to the snippet response in case of 410 Gone
    return snippet as GetSnippetByIdResponse | ApiErrorResponse;
  },
});

function RouteComponent() {
  // At this point, the loader data is either GetSnippetByIdResponse or
  // ApiErrorResponse because the response is either the snippet or an error
  // response
  const loadedData = Route.useLoaderData() as GetSnippetByIdResponse | ApiErrorResponse;

  // Prepare props for useSnippetForm, defaulting if loadedData is an error
  const initialCodeForHook = ('error' in loadedData)
    ? ''
    : loadedData.content;
  const initialLanguageForHook = ('error' in loadedData)
    ? 'PLAINTEXT' as Language
    : loadedData.language;

  const {
    // Form field states and setters
    code,

    // Derived/Computed values for rendering
    highlightedHtml,
    codeClassName,

    // Constants
    MAX_CODE_LENGTH,
  } = useSnippetForm({
    initialCode: initialCodeForHook,
    initialLanguage: initialLanguageForHook,
  });

  // Dummy onCodeChange for read-only editor
  // TODO: see if needed, or can be removed if useSnippetForm doesn't return it
  // when read-only
  const handleCodeChange = () => {};

  // Now, check for error and return error UI if necessary
  if ('error' in loadedData && loadedData.error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-50">
        <div className="w-full max-w-xl mx-auto text-center">
          <ShieldIcon className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-semibold text-slate-800 mb-2">
            {loadedData.error}
          </h1>
          <p className="text-slate-600 mb-6">
            {loadedData.message}
          </p>
          <Link to="/">
            <Button
              variant="outline"
              size="sm"
              className="border-teal-600 text-teal-600 hover:text-teal-700 hover:border-teal-700 flex items-center gap-2 mx-auto"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  // If we are here, loadedData is GetSnippetByIdResponse. We can use its
  // properties directly
  const {
    title,
    expires_at,
    max_views,
    name,
    created_at,
  } = loadedData as GetSnippetByIdResponse; // Safe cast as error case is handled

  const isExpired = hasExpiredByTime(expires_at);

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
              {isExpired
                ? (
                    <div className="text-center py-8">
                      <p className="text-xl font-semibold text-slate-600">
                        This snippet has expired.
                      </p>
                    </div>
                  )
                : (
                    <CodeEditor
                      code={code}
                      onCodeChange={handleCodeChange} // no-op for read-only editor
                      highlightedHtml={highlightedHtml}
                      codeClassName={codeClassName}
                      MAX_CODE_LENGTH={MAX_CODE_LENGTH}
                      isReadOnly={true}
                    />
                  )}
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
