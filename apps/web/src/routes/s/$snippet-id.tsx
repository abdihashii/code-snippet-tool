import type {
  ApiErrorResponse,
  GetSnippetByIdResponse,
  Language,
} from '@snippet-share/types';

import { createFileRoute, Link } from '@tanstack/react-router';
import {
  ArrowLeftIcon,
  ClockIcon,
  EyeIcon,
  LockIcon,
  ShieldIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { getSnippetById } from '@/api/snippets-api';
import { Header } from '@/components/layout/header';
import { CodeEditor } from '@/components/snippet/code-editor';
import {
  SnippetExpiredMessage,
} from '@/components/snippet/snippet-expired-message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useSnippetForm } from '@/hooks/use-snippet-form';
import { decryptSnippet } from '@/lib/crypto';
import {
  formatExpiryTimestamp,
  formatTimestamp,
  hasExpiredByTime,
  hasReachedMaxViews,
} from '@/lib/utils';

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
  const [password, setPassword] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);

  // At this point, the loader data is either GetSnippetByIdResponse or
  // ApiErrorResponse because the response is either the snippet or an error
  // response
  const loadedData
  = Route.useLoaderData() as GetSnippetByIdResponse | ApiErrorResponse;

  // Check if this is a password-protected snippet
  const isPasswordProtected = !('error' in loadedData)
    && loadedData.encrypted_dek
    && loadedData.iv_for_dek
    && loadedData.auth_tag_for_dek
    && loadedData.kdf_salt
    && loadedData.kdf_parameters;

  // Prepare props for useSnippetForm, defaulting if loadedData is an error
  const initialCodeForHook = ('error' in loadedData)
    ? ''
    : decryptedContent || loadedData.encrypted_content;
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

  // Handle password submission
  const handlePasswordSubmit = async () => {
    if (!password) return;

    try {
      if ('error' in loadedData) return;

      const decrypted = await decryptSnippet({
        encryptedContent: loadedData.encrypted_content,
        iv: loadedData.initialization_vector,
        authTag: loadedData.auth_tag,
        encryptedDek: loadedData.encrypted_dek!,
        ivForDek: loadedData.iv_for_dek!,
        authTagForDek: loadedData.auth_tag_for_dek!,
        kdfSalt: loadedData.kdf_salt!,
        kdfParameters: loadedData.kdf_parameters!,
        password,
      });

      setDecryptedContent(decrypted);
      setShowPasswordDialog(false);
      setDecryptionError(null);
    } catch (err) {
      console.error('Failed to decrypt with password:', err);
      setDecryptionError('Invalid password. Please try again.');
    }
  };

  // Handle regular snippet decryption (with DEK from URL fragment)
  const handleRegularDecryption = async () => {
    if ('error' in loadedData) return;

    try {
      const dek = window.location.hash.substring(1);

      if (!dek) {
        console.error('No decryption key found in URL');
        throw new Error('No decryption key found in URL');
      }

      const decrypted = await decryptSnippet({
        encryptedContent: loadedData.encrypted_content,
        iv: loadedData.initialization_vector,
        authTag: loadedData.auth_tag,
        dek,
      });

      setDecryptedContent(decrypted);
      setDecryptionError(null);
    } catch (err) {
      console.error('Failed to decrypt snippet:', err);
      setDecryptionError(
        'Failed to decrypt snippet. The link may be invalid or corrupted.',
      );
    }
  };

  // Attempt decryption when component mounts
  useEffect(() => {
    if ('error' in loadedData) return;

    if (isPasswordProtected) {
      setShowPasswordDialog(true);
    } else {
      handleRegularDecryption();
    }
  }, [loadedData]);

  // Now, check for error and return error UI if necessary
  if ('error' in loadedData && loadedData.error) {
    // Check for specific API error messages that indicate the snippet is not
    // available
    const errorTitle = loadedData.error;
    const errorMessage = (loadedData as ApiErrorResponse).message
      || 'This snippet could not be retrieved.';

    if (
      errorTitle === 'Snippet expired'
      || errorTitle === 'Snippet has reached its maximum view limit.'
      || errorTitle === 'Snippet not found or access denied'
    ) {
      return (
        <main
          className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-50"
        >
          <div className="w-full max-w-xl mx-auto">
            <SnippetExpiredMessage
              title={errorTitle}
              message={errorMessage}
              showGoHomeButton={true}
            />
          </div>
        </main>
      );
    }

    // For other, unexpected errors that still have the 'error' property
    // structure, display the error message returned from the response
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
          <Link to="/new">
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
    current_views,
    name,
    created_at,
  } = loadedData as GetSnippetByIdResponse; // Safe cast as error case is handled

  const isExpired = hasExpiredByTime(expires_at);
  // Client-side check for max views, in case API doesn't return 403 for some
  // reason but snippet data is fetched
  const hasReachedDisplayLimit = max_views !== null && current_views !== undefined
    ? hasReachedMaxViews(current_views, max_views)
    : false;

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-start p-4 sm:p-6 md:p-8 bg-slate-50"
    >
      <div className="w-full max-w-3xl mx-auto">
        <Header />

        <div className="transition-all duration-300 ease-in-out">
          <Card className="w-full shadow-md border-slate-200 bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-slate-800 dark:text-slate-100">
                  {title || 'Untitled Snippet'}
                </CardTitle>
                <div className="flex space-x-2">
                  {isPasswordProtected && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 text-xs"
                    >
                      <LockIcon className="h-3 w-3" />
                      Password Protected
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 text-xs"
                  >
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
                  {' '}
                  {name}
                </p>
              )}
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Created:
                {' '}
                {formatTimestamp(created_at)}
              </p>
            </CardHeader>

            <CardContent>
              {isExpired
                ? (
                    <SnippetExpiredMessage
                      title="Snippet Expired"
                      message="This snippet has expired based on its set expiry time and is no longer viewable."
                    />
                  )
                : hasReachedDisplayLimit
                  ? (
                      <SnippetExpiredMessage
                        title="View Limit Reached"
                        message="This snippet has reached its maximum view limit and is no longer available."
                      />
                    )
                  : decryptionError
                    ? (
                        <div className="text-center py-8">
                          <ShieldIcon
                            className="h-12 w-12 mx-auto mb-4 text-red-500"
                          />
                          <h3
                            className="text-lg font-semibold text-slate-800 mb-2"
                          >
                            {decryptionError}
                          </h3>
                          {isPasswordProtected && (
                            <Button
                              variant="outline"
                              onClick={() => setShowPasswordDialog(true)}
                              className="mt-4"
                            >
                              Try Again
                            </Button>
                          )}
                        </div>
                      )
                    : (
                        <CodeEditor
                          code={code}
                          onCodeChange={() => {}}
                          highlightedHtml={highlightedHtml}
                          codeClassName={codeClassName}
                          MAX_CODE_LENGTH={MAX_CODE_LENGTH}
                          isReadOnly={true}
                        />
                      )}
            </CardContent>

            <CardFooter className="flex justify-center">
              <Link to="/new">
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

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Protected Snippet</DialogTitle>
            <DialogDescription>
              This snippet is password protected. Please enter the password to view its contents.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handlePasswordSubmit();
                }
              }}
            />
            {decryptionError && (
              <p className="text-sm text-red-500 mt-2">{decryptionError}</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handlePasswordSubmit}>Decrypt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
