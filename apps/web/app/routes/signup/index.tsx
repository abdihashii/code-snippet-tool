import type { SignupFormData } from '@snippet-share/schemas';

import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '@snippet-share/schemas';
import { createFileRoute } from '@tanstack/react-router';
import { EyeIcon, EyeOffIcon, Loader2Icon, LogInIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';

export const Route = createFileRoute('/signup/')({
  component: RouteComponent,
});

function RouteComponent() {
  const {
    // State
    isLoading,
    userData,
    error,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,

    // Actions
    signUp,
  } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = (data: SignupFormData) => {
    signUp(data.email, data.password, data.confirmPassword);
  };

  if (error) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-4">
          <p>
            There was an error:
          </p>
          <pre><code>{JSON.stringify(error, null, 2)}</code></pre>
        </div>
      </AppLayout>
    );
  }

  if (userData) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-4">
          <p>
            Sign up successful:
          </p>
          <pre><code>{JSON.stringify(userData, null, 2)}</code></pre>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="w-full max-w-md shadow-md border-slate-200 bg-white mx-auto">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="mb-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="signup_email">Email</Label>
                  <Input
                    id="signup_email"
                    type="email"
                    {...register('email')}
                  />
                  {errors.email && (
                    <span className="text-sm text-red-600">
                      {errors.email.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="signup_password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup_password"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                    />
                    <div
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-3"
                    >
                      <span
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword
                          ? <EyeIcon className="h-4 w-4" />
                          : <EyeOffIcon className="h-4 w-4" />}
                      </span>
                    </div>
                  </div>
                  {errors.password && (
                    <span className="text-sm text-red-600">
                      {errors.password.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="signup_confirm_password">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="signup_confirm_password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword')}
                    />
                    <div
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-3"
                    >
                      <span
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                        onClick={
                          () => setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword
                          ? <EyeIcon className="h-4 w-4" />
                          : <EyeOffIcon className="h-4 w-4" />}
                      </span>
                    </div>
                  </div>
                  {errors.confirmPassword && (
                    <span className="text-sm text-red-600">
                      {errors.confirmPassword.message}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-center">
              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 hover:cursor-pointer flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading
                  ? (
                      <>
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                        Signing Up
                      </>
                    )
                  : (
                      <>
                        <LogInIcon className="h-4 w-4" />
                        Sign Up
                      </>
                    )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
