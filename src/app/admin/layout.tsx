'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { RoleShell } from '@/components/layout/role-shell';
import { AdminProvider } from '@/contexts/admin-context';
import { useAuth } from '@/contexts/auth-context';

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/admin');
      return;
    }
    if (user.role !== 'admin') {
      router.replace('/athlete/home');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--fn-primary)] border-t-transparent" />
      </div>
    );
  }

  return children;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin';

  if (isLoginPage) {
    return children;
  }

  return (
    <AdminProvider>
      <AdminGuard>
        <RoleShell>{children}</RoleShell>
      </AdminGuard>
    </AdminProvider>
  );
}
