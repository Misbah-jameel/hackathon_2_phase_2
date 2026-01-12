'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { loginSchema, type LoginFormData } from '@/lib/schemas';
import { ROUTES, SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/lib/constants';

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const { success, error: showError } = useToast();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || undefined;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = await login(data, returnTo);

    if (result.success) {
      success(SUCCESS_MESSAGES.LOGGED_IN);
    } else {
      showError(result.error || ERROR_MESSAGES.LOGIN_ERROR);
      // Set form-level error for accessibility
      setError('root', { message: result.error || ERROR_MESSAGES.LOGIN_ERROR });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Form-level error */}
      {errors.root && (
        <div
          className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm"
          role="alert"
        >
          {errors.root.message}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        disabled={isLoading}
        {...register('email')}
      />

      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        autoComplete="current-password"
        error={errors.password?.message}
        disabled={isLoading}
        {...register('password')}
      />

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Sign In
      </Button>

      <p className="text-center text-sm text-gray-secondary">
        Don&apos;t have an account?{' '}
        <Link
          href={ROUTES.SIGNUP}
          className="text-primary hover:text-primary-dark font-medium transition-colors"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
