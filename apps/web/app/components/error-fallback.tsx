/// <reference types="vite/client" />

import { useRouter } from '@tanstack/react-router';
import { AlertTriangleIcon, HomeIcon, RefreshCwIcon } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  variant?: 'page' | 'component' | 'inline';
  title?: string;
  description?: string;
  showHomeButton?: boolean;
  showErrorDetails?: boolean;
}

export function ErrorFallback({
  error,
  resetError,
  variant = 'page',
  title,
  description,
  showHomeButton = true,
  showErrorDetails = import.meta.env.DEV,
}: ErrorFallbackProps) {
  const router = useRouter();
  const defaultTitle = 'Something went wrong';
  const defaultDescription = 'An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.';

  if (variant === 'inline') {
    return (
      <div
        className="p-4 border border-destructive/30 bg-destructive/10 text-destructive rounded-md"
      >
        <div className="flex items-start space-x-3">
          <AlertTriangleIcon className="h-5 w-5 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium">
              {title || 'Error loading component'}
            </h3>
            <p className="text-sm mt-1 opacity-90">
              {description || 'This section could not be loaded properly.'}
            </p>
            <div className="mt-3">
              <Button
                onClick={resetError}
                size="sm"
                variant="outline"
                className="border-destructive/50 text-destructive hover:bg-destructive/20"
              >
                <RefreshCwIcon className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </div>
          </div>
        </div>
        {showErrorDetails && (
          <details className="mt-4 text-xs">
            <summary className="cursor-pointer font-medium">
              Error Details (Development)
            </summary>
            <pre className="mt-2 whitespace-pre-wrap wrap-break-words bg-background p-2 rounded border">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    );
  }

  if (variant === 'component') {
    return (
      <Card className="border-destructive/30 bg-destructive/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-destructive flex items-center space-x-2">
            <AlertTriangleIcon className="h-5 w-5" />
            <span>{title || 'Component Error'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-destructive/90 text-sm">
            {description || 'This component encountered an error and could not be displayed.'}
          </p>
          <div className="flex space-x-2">
            <Button
              onClick={resetError}
              size="sm"
              variant="outline"
              className="border-destructive/50 text-destructive hover:bg-destructive/20"
            >
              <RefreshCwIcon className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </div>
          {showErrorDetails && (
            <details className="text-xs text-destructive">
              <summary className="cursor-pointer font-medium">
                Error Details (Development)
              </summary>
              <pre
                className="mt-2 whitespace-pre-wrap wrap-break-words bg-background p-2 rounded border text-xs"
              >
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default 'page' variant
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-muted"
    >
      <div className="w-full max-w-md mx-auto">
        <Card className="shadow-md border-destructive/30 bg-card">
          <CardHeader className="text-center">
            <div
              className="mx-auto w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center mb-4"
            >
              <AlertTriangleIcon className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl text-destructive">
              {title || defaultTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              {description || defaultDescription}
            </p>
            {showErrorDetails && (
              <details
                className="text-left text-sm text-muted-foreground bg-muted p-3 rounded border"
              >
                <summary className="cursor-pointer font-medium mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="whitespace-pre-wrap wrap-break-words text-xs">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                onClick={resetError}
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              {showHomeButton && (
                <Button
                  onClick={() => router.navigate({ to: '/' })}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <HomeIcon className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Specialized fallback components for different use cases
export const SnippetErrorFallback: React.FC<Omit<ErrorFallbackProps, 'variant'>> = (props) => (
  <ErrorFallback
    {...props}
    variant="component"
    title="Snippet Error"
    description="Unable to load or display this snippet. Please check the link and try again."
  />
);

export const CodeEditorErrorFallback: React.FC<Omit<ErrorFallbackProps, 'variant'>> = (props) => (
  <ErrorFallback
    {...props}
    variant="inline"
    title="Code Editor Error"
    description="The code editor could not be loaded properly."
  />
);

export const FormErrorFallback: React.FC<Omit<ErrorFallbackProps, 'variant'>> = (props) => (
  <ErrorFallback
    {...props}
    variant="component"
    title="Form Error"
    description="There was an error with the form. Please refresh and try again."
    showHomeButton={false}
  />
);
