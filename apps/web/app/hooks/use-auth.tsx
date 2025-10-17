import type { RateLimitInfo } from '@snippet-share/types';

import { signupSchema } from '@snippet-share/schemas';
import { useState } from 'react';

import { signUp } from '@/lib/api/auth-apis';
import { RateLimitService } from '@/lib/services';

export function useAuth() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userDataState, setUserDataState] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);
  const [isRateLimited, setIsRateLimited] = useState<boolean>(false);
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
    // Clear previous errors but keep rate limit state visible
    setError(null);

    // Second stage input validation
    const validationResult = signupSchema
      .safeParse({ email, password, confirmPassword });

    if (!validationResult.success) {
      setError(validationResult.error.message);
      return;
    }

    setIsLoading(true);
    try {
      const result = await signUp(email, password, confirmPassword);

      // Extract rate limit info from response (available on both success and error)
      if (result.data?.rateLimitInfo) {
        setRateLimitInfo(result.data.rateLimitInfo);
      }

      // Check if signup was successful
      if (!result.success) {
        setError(result.error || 'Failed to sign up');
        setIsRateLimited(false);
        return;
      }

      // Handle successful signup
      if (!result.data.userData) {
        throw new Error(
          'User data was not received properly from the server.',
        );
      }

      setIsRateLimited(false);
      setUserDataState(result.data.userData);
    } catch (signupError: any) {
      console.error('Signup error:', signupError);

      // First, check if the error is a rate limit error
      if (signupError instanceof RateLimitService.RateLimitError) {
        setIsRateLimited(true);
        setRateLimitInfo(signupError.rateLimitInfo);
        setError(signupError.message);
      } else {
        // If not a rate limit error, handle other errors
        const errorMessage = signupError instanceof Error
          ? signupError.message
          : 'An unexpected error occurred during signup. Please try again.';

        setError(errorMessage);
      }
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
    rateLimitInfo,
    setRateLimitInfo,
    isRateLimited,
    setIsRateLimited,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,

    // Actions
    signUp: signUpInternal,
  };
}
