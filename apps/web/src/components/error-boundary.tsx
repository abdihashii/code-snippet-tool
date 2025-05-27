import { useRouter } from '@tanstack/react-router';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-50">
      <div className="w-full max-w-md mx-auto">
        <Card className="shadow-md border-red-200 bg-white">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-red-600">
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-slate-600">
              An unexpected error occurred while rendering this page.
            </p>
            {import.meta.env.DEV && (
              <details className="text-left text-sm text-slate-500 bg-slate-50 p-3 rounded border">
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
                onClick={resetError}
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50"
              >
                Try Again
              </Button>
              <Button
                onClick={() => router.navigate({ to: '/' })}
                className="bg-teal-600 hover:bg-teal-700"
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

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
