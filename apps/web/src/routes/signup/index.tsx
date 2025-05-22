import { createFileRoute } from '@tanstack/react-router';
import { EyeIcon, EyeOffIcon, Loader2Icon, LogInIcon } from 'lucide-react';

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
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,

    // Actions
    signUp,
  } = useAuth();

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
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="signup_email">Email</Label>
              <Input
                id="signup_email"
                type="email"
                value={email}
                onChange={({ target }) => setEmail(target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="signup_password">Password</Label>
              <div className="relative">
                <Input
                  id="signup_password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={({ target }) => setPassword(target.value)}
                  required
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
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="signup_confirm_password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="signup_confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={({ target }) => setConfirmPassword(target.value)}
                  required
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
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 hover:cursor-pointer flex items-center justify-center gap-2"
            onClick={() => signUp(email, password, confirmPassword)}
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
      </Card>
    </AppLayout>
  );
}
