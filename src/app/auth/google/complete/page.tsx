'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { setTokens } from '@/services/api-client';
import type { UserRole } from '@/types/api';

function homeForRole(role: UserRole): string {
  if (role === 'instructor') return '/instructor/dashboard';
  if (role === 'institution') return '/gym/dashboard';
  return '/athlete/home';
}

export default function GoogleCompletePage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      try {
        const res = await fetch('/api/auth/google/session');
        if (!res.ok) throw new Error('Session expired');

        const data = (await res.json()) as {
          accessToken: string;
          refreshToken: string;
          role: UserRole;
        };

        setTokens(data.accessToken, data.refreshToken);
        await refreshUser();

        if (!cancelled) {
          router.replace(homeForRole(data.role));
        }
      } catch {
        if (!cancelled) {
          setError('No se pudo completar el inicio de sesión con Google.');
          router.replace(
            `/auth/login?googleError=${encodeURIComponent('No se pudo completar el inicio de sesión con Google.')}`,
          );
        }
      }
    }

    finish();
    return () => {
      cancelled = true;
    };
  }, [router, refreshUser]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-[var(--fn-text-muted)]">
        {error}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-[var(--fn-text-muted)]">
      Completando inicio de sesión con Google...
    </div>
  );
}
