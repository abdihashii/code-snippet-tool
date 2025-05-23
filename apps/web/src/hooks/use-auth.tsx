import { useState } from 'react';

import { signUp } from '@/api/auth-apis';

export function useAuth() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userDataState, setUserDataState] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState<boolean>(false);

  async function signUpInternal(
    email: string,
    password: string,
    confirmPassword: string,
  ) {
    // Clear previous errors
    setError(null);

    // Second stage input validation
    if (password !== confirmPassword) {
      setError('Both passwords need to be the same.');
      return;
    }

    setIsLoading(true);
    try {
      const userData = await signUp(email, password, confirmPassword);

      if (!userData) {
        throw new Error(
          'User data was not received properly from the server.',
        );
      }

      setUserDataState(userData);
    } catch (signupError: any) {
      console.error('Signup error:', signupError);

      const errorMessage = signupError instanceof Error
        ? signupError.message
        : 'An unexpected error occurred during signup. Please try again.';

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    // State
    isLoading,
    setIsLoading,
    userData: userDataState,
    setUserData: setUserDataState,
    error,
    setError,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,

    // Actions
    signUp: signUpInternal,
  };
}
