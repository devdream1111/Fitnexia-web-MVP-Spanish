'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { LandingPage } from '@/components/landing/landing-page';
import { useAuth } from '@/contexts/auth-context';
import type { UserRole } from '@/types/api';

function homeForRole(role: UserRole) {
  if (role === 'instructor') return '/instructor/dashboard';
  if (role === 'institution') return '/gym/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return '/athlete/home';
}

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || !user) return;
    router.replace(homeForRole(user.role));
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return null;
  }

  return <LandingPage />;
}
