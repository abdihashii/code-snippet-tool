/// <reference types="vite/client" />

import { useState } from 'react';

import { Button } from '@/components/ui/button';

interface ErrorTestProps {
  shouldThrow?: boolean;
}

export function ErrorTest({ shouldThrow = false }: ErrorTestProps) {
  const [throwError, setThrowError] = useState(shouldThrow);

  // Only show in development
  if (!import.meta.env.DEV) {
    return null;
  }

  if (throwError) {
    throw new Error('Test error boundary: Intentional error for testing purposes');
  }

  return (
    <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-md">
      <h3 className="text-sm font-medium text-yellow-800 mb-2">
        Error Boundary Test Component
      </h3>
      <p className="text-sm text-yellow-700 mb-3">
        This component can trigger an intentional error to test error boundaries.
      </p>
      <Button
        onClick={() => setThrowError(true)}
        variant="outline"
        size="sm"
        className="border-yellow-600 text-yellow-700 hover:bg-yellow-100"
      >
        Trigger Error
      </Button>
    </div>
  );
}
