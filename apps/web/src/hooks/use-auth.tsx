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
    // Second stage input validation
    if (password !== confirmPassword) {
      setError('Both passwords need to be the same.');
      return;
    }

    setIsLoading(true);
    try {
      const { userData } = await signUp(email, password, confirmPassword);

      if (!userData) {
        throw new Error('User data was not sent properly for some reason.');
      }

      setUserDataState(userData);
    } catch (signupError: any) {
      setError(signupError);
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
