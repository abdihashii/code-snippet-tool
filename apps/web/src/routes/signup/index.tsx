import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { EyeIcon, EyeOffIcon, Loader2Icon, LogInIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';

// Validation schema
const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string(),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

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
        <p>
          There was an error:
          {' '}
          {error}
        </p>
      </AppLayout>
    );
  }

  if (userData) {
    return (
      <p>
        Sign up successful:
        {' '}
        <pre><code>{JSON.stringify(userData, null, 2)}</code></pre>
      </p>
    );
  }

  return (
    <AppLayout>
      <Card className="w-1/2 shadow-md border-slate-200 bg-white mx-auto">
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
    </AppLayout>
  );
}
