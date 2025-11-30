import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { GithubIcon, Loader2Icon } from 'lucide-react';
import { useEffect } from 'react';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

export const Route = createFileRoute('/login/')({
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>) => ({
    error: search.error as string | undefined,
    callbackUrl: search.callbackUrl as string | undefined,
  }),
});

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const { error: urlError, callbackUrl } = useSearch({ from: '/login/' });

  const {
    isLoading,
    error,
    isAuthenticated,
    isSessionLoading,
    signInWithSocial,
  } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isSessionLoading && isAuthenticated) {
      navigate({ to: callbackUrl || '/' });
    }
  }, [isAuthenticated, isSessionLoading, navigate, callbackUrl]);

  const handleGoogleSignIn = () => {
    signInWithSocial('google', callbackUrl || '/');
  };

  const handleGitHubSignIn = () => {
    signInWithSocial('github', callbackUrl || '/');
  };

  const displayError = error || (urlError === 'oauth' ? 'OAuth sign in failed. Please try again.' : urlError);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="w-full max-w-md shadow-md border-border bg-card mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription>
              Sign in to save and manage your snippets
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {displayError && (
              <div className="p-3 rounded bg-destructive/10 text-destructive text-sm">
                {displayError}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading
                ? <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
                : <GoogleIcon className="h-4 w-4 mr-2" />}
              Continue with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGitHubSignIn}
              disabled={isLoading}
            >
              {isLoading
                ? <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
                : <GithubIcon className="h-4 w-4 mr-2" />}
              Continue with GitHub
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
