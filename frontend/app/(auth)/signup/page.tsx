import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SignupForm } from '@/components/auth/SignupForm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create a TodoApp account to start managing your tasks effectively.',
};

function SignupFormWrapper() {
  return (
    <Suspense fallback={<SignupFormSkeleton />}>
      <SignupForm />
    </Suspense>
  );
}

function SignupFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton variant="text" height={16} width={50} />
        <Skeleton variant="rectangular" height={48} />
      </div>
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

export default function SignupPage() {
  return (
    <Card padding="lg" className="shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>
          Get started with TodoApp and boost your productivity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignupFormWrapper />
      </CardContent>
    </Card>
  );
}
