import type {
  ApiResponse,
  GetSnippetByIdResponse,
  Language,
} from '@snippet-share/types';

import { createFileRoute, Link } from '@tanstack/react-router';
import {
  ArrowLeftIcon,
  ClockIcon,
  EyeIcon,
  Loader2,
  LockIcon,
  ShieldIcon,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { AppLayout } from '@/components/layout/app-layout';
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
import { Input } from '@/components/ui/input';
import { useSnippetForm } from '@/hooks/use-snippet-form';
import { getSnippetById } from '@/lib/api/snippets-api';
import { DecryptionService } from '@/lib/services';
import { formatExpiryTimestamp, formatTimestamp } from '@/lib/utils';
import { hasExpiredByTime, hasReachedMaxViews } from '@/lib/utils/expiry-utils';

type LoaderResponse = ApiResponse<GetSnippetByIdResponse>;

export const Route = createFileRoute('/s/$snippet-id')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const snippetId = params['snippet-id'];
    const snippet = await getSnippetById(snippetId);
    return snippet as LoaderResponse;
  },
});

function RouteComponent() {
  const [password, setPassword] = useState('');
  const [
    decryptedContent,
    setDecryptedContent,
  ] = useState<string | null>(null);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Get the loader data as ApiResponse<GetSnippetByIdResponse>
  const loadedData = Route.useLoaderData() as LoaderResponse;

  // Extract data for successful responses, or use defaults for error cases
  const snippetData = loadedData.success ? loadedData.data : null;

  // Check if this is a password-protected snippet
  const isPasswordProtected = snippetData?.encrypted_dek
    && snippetData?.iv_for_dek
    && snippetData?.auth_tag_for_dek
    && snippetData?.kdf_salt
    && snippetData?.kdf_parameters;

  // Prepare props for useSnippetForm
  const initialCodeForHook = decryptedContent
    || snippetData?.encrypted_content
    || '';
  const initialLanguageForHook = snippetData?.language
    || ('PLAINTEXT' as Language);

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
    if (!password || !snippetData) return;
    setIsDecrypting(true);
    setDecryptionError(null);

    try {
      const decrypted = await DecryptionService.decryptSnippet({
        encryptedContent: snippetData.encrypted_content,
        iv: snippetData.initialization_vector,
        authTag: snippetData.auth_tag,
        encryptedDek: snippetData.encrypted_dek!,
        ivForDek: snippetData.iv_for_dek!,
        authTagForDek: snippetData.auth_tag_for_dek!,
        kdfSalt: snippetData.kdf_salt!,
        kdfParameters: snippetData.kdf_parameters!,
        password,
      });

      setDecryptedContent(decrypted);
      setDecryptionError(null);
    } catch (err) {
      console.error('Failed to decrypt with password:', err);
      setDecryptionError('Invalid password. Please try again.');
    } finally {
      setIsDecrypting(false);
    }
  };

  // Handle regular snippet decryption (with DEK from URL fragment)
  const handleRegularDecryption = useCallback(async () => {
    if (!snippetData) return;
    setIsDecrypting(true);
    setDecryptionError(null);

    try {
      const dek = window.location.hash.substring(1);

      if (!dek) {
        console.error('No decryption key found in URL');
        throw new Error('No decryption key found in URL');
      }

      const decrypted = await DecryptionService.decryptSnippet({
        encryptedContent: snippetData.encrypted_content,
        iv: snippetData.initialization_vector,
        authTag: snippetData.auth_tag,
        dek,
      });

      setDecryptedContent(decrypted);
      setDecryptionError(null);
    } catch (err) {
      console.error('Failed to decrypt snippet:', err);
      setDecryptionError(
        'Failed to decrypt snippet. The link may be invalid or corrupted.',
      );
    } finally {
      setIsDecrypting(false);
    }
  }, [snippetData, setDecryptedContent, setDecryptionError, setIsDecrypting]);

  // Attempt decryption when component mounts
  useEffect(() => {
    if (!snippetData) return;

    // If not password protected, and not yet decrypted or decrypting, try to
    // decrypt.
    if (!isPasswordProtected && !decryptedContent && !isDecrypting) {
      handleRegularDecryption();
    }
    // For password-protected snippets, decryption is now user-triggered.
  }, [
    snippetData,
    isPasswordProtected,
    decryptedContent,
    isDecrypting,
    handleRegularDecryption,
  ]);

  // Now handle error cases after all hooks are called
  if (!loadedData.success) {
    const errorTitle = loadedData.error;
    const errorMessage = loadedData.message
      || 'This snippet could not be retrieved.';

    if (
      errorTitle === 'Snippet expired'
      || errorTitle === 'Snippet has reached its maximum view limit.'
      || errorTitle === 'Snippet not found or access denied'
    ) {
      return (
        <main
          className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-background"
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

    // For other, unexpected errors
    return (
      <main
        className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-background"
      >
        <div className="w-full max-w-xl mx-auto text-center">
          <ShieldIcon className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            {loadedData.error}
          </h1>
          <p className="text-muted-foreground mb-6">
            {loadedData.message}
          </p>
          <Link to="/new">
            <Button
              variant="outline"
              size="sm"
              className="border-primary text-primary hover:text-primary/90 hover:border-primary/90 flex items-center gap-2 mx-auto"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  // At this point we know snippetData exists (success case)
  const {
    title,
    expires_at,
    max_views,
    current_views,
    name,
    created_at,
  } = snippetData!; // Non-null assertion since we're in success case

  const isExpired = hasExpiredByTime(expires_at);
  // Client-side check for max views, in case API doesn't return 403 for some
  // reason but snippet data is fetched
  const hasReachedDisplayLimit = max_views !== null && current_views !== undefined
    ? hasReachedMaxViews(current_views, max_views)
    : false;

  return (
    <AppLayout>
      <div className="transition-all duration-300 ease-in-out">
        <Card className="w-full shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-foreground">
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
              <p className="text-sm text-muted-foreground mt-1">
                Shared by:
                {' '}
                {name}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
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
                : isDecrypting
                  ? (
                      <div className="text-center py-8">
                        <Loader2
                          className="h-12 w-12 mx-auto mb-4 animate-spin text-primary"
                        />
                        <h3 className="text-lg font-semibold text-foreground">
                          Decrypting...
                        </h3>
                      </div>
                    )
                  : isPasswordProtected && !decryptedContent
                    ? (
                        <div>
                          <div
                            className="rounded-md border bg-muted/50 px-6 py-8 space-y-4"
                          >
                            <div className="mb-2">
                              <h3
                                className="text-lg font-semibold leading-none tracking-tight"
                              >
                                Password Protected Snippet
                              </h3>
                              <p
                                className="text-sm text-muted-foreground mt-1"
                              >
                                This snippet is password protected. Please enter the password to view its contents.
                              </p>
                            </div>
                            <div className="space-y-2">
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
                                <p
                                  className="text-sm text-destructive"
                                >
                                  {decryptionError}
                                </p>
                              )}
                            </div>
                            <div className="flex justify-end mt-2">
                              <Button
                                onClick={handlePasswordSubmit}
                                disabled={isDecrypting}
                                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                              >
                                {isDecrypting ? 'Decrypting...' : 'Decrypt'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    : decryptionError
                      ? (
                          <div className="text-center py-8">
                            <ShieldIcon
                              className="h-12 w-12 mx-auto mb-4 text-destructive"
                            />
                            <h3
                              className="text-lg font-semibold text-foreground mb-2"
                            >
                              {decryptionError}
                            </h3>
                          </div>
                        )
                      : decryptedContent
                        ? (
                            <CodeEditor
                              code={code}
                              onCodeChange={() => {}}
                              highlightedHtml={highlightedHtml}
                              codeClassName={codeClassName}
                              MAX_CODE_LENGTH={MAX_CODE_LENGTH}
                              isReadOnly={true}
                              title={title ?? 'Untitled Snippet'}
                            />
                          )
                        : (
                            <div className="text-center py-8">
                              <Loader2
                                className="h-6 w-6 mx-auto animate-spin text-muted-foreground"
                              />
                              <p className="text-sm text-muted-foreground mt-2">Loading snippet...</p>
                            </div>
                          )}
          </CardContent>

          <CardFooter className="flex justify-center">
            <Link to="/new">
              <Button
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:text-primary/90 hover:border-primary/90 hover:cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}
