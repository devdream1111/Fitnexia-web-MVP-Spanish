'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/contexts/auth-context';

export default function HomePage() {
  const router = useRouter();
  const { user, hasSeenOnboarding, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!hasSeenOnboarding) {
      router.replace('/onboarding');
      return;
    }
    if (!user) {
      router.replace('/auth/login');
      return;
    }
    if (user.role === 'instructor') {
      router.replace('/instructor/dashboard');
      return;
    }
    if (user.role === 'institution') {
      router.replace('/gym/dashboard');
      return;
    }
    router.replace('/athlete/home');
  }, [user, hasSeenOnboarding, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--fn-primary)] border-t-transparent" />
    </div>
  );
}
