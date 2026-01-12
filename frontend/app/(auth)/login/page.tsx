import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your TodoApp account to manage your tasks.',
};

function LoginFormWrapper() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton variant="text" height={16} width={60} />
        <Skeleton variant="rectangular" height={48} />
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" height={16} width={80} />
        <Skeleton variant="rectangular" height={48} />
      </div>
      <Skeleton variant="rectangular" height={48} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Card padding="lg" className="shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your account to continue managing your tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginFormWrapper />
      </CardContent>
    </Card>
  );
}
