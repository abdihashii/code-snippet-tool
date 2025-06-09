import type { ErrorInfo } from 'react';
import type { FallbackProps } from 'react-error-boundary';

import { useRouter } from '@tanstack/react-router';
import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function DefaultErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const router = useRouter();
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-muted"
    >
      <div className="w-full max-w-md mx-auto">
        <Card className="shadow-md border-destructive/30 bg-card">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-destructive">
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              An unexpected error occurred while rendering this page.
            </p>
            {import.meta.env.DEV && (
              <details
                className="text-left text-sm text-muted-foreground bg-muted p-3 rounded border"
              >
                <summary className="cursor-pointer font-medium mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="whitespace-pre-wrap break-words">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                onClick={resetErrorBoundary}
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                Try Again
              </Button>
              <Button
                onClick={() => router.navigate({ to: '/' })}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<FallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export function ErrorBoundary({ children, fallback, onError }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback || DefaultErrorFallback}
      onError={onError}
    >
      {children}
    </ReactErrorBoundary>
  );
}
