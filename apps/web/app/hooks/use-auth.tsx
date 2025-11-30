import { useCallback, useState } from 'react';

import { authClient } from '@/lib/auth/auth-client';
import { AuthService } from '@/lib/services';

// Re-export useSession from Better Auth for direct usage
export const useSession = authClient.useSession;

export function useAuth() {
  const {
    data: session,
    isPending: isSessionLoading,
    error: sessionError,
    refetch,
  } = authClient.useSession();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithSocial = useCallback(async (
    provider: 'google' | 'github',
    callbackURL: string = '/',
  ) => {
    setError(null);
    setIsLoading(true);

    try {
      await authClient.signIn.social({
        provider,
        callbackURL,
        errorCallbackURL: '/login?error=oauth',
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? err.message
        : `Failed to sign in with ${provider}`;
      setError(errorMessage);
      setIsLoading(false);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    try {
      await authClient.signOut();
      AuthService.clearToken();
    } catch (err: unknown) {
      console.error('Sign out error:', err);
    }
  }, []);

  return {
    // Session state from Better Auth
    session,
    user: session?.user ?? null,
    isAuthenticated: !!session?.user,
    isSessionLoading,
    sessionError,
    refetchSession: refetch,

    // Loading and error state
    isLoading,
    setIsLoading,
    error,
    setError,

    // Auth actions
    signInWithSocial,
    signOut: signOutUser,
  };
}
