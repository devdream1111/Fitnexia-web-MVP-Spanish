'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { ADMIN_LABELS, AUTH_LABELS, ALERT_LABELS } from '@/constants/labels';

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, isLoading, login } = useAuth();
  const { isDark, toggleDarkMode } = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoading || !user) return;
    if (user.role === 'admin') {
      router.replace('/admin/dashboard');
      return;
    }
    router.replace('/athlete/home');
  }, [user, isLoading, router]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError(ALERT_LABELS.fillAllFields);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password, 'admin');
      router.replace('/admin/dashboard');
    } catch {
      setError(ADMIN_LABELS.login.accessDenied);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--fn-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-[var(--fn-border)] bg-[var(--fn-surface)]">
        <div className="fn-layout-shell flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo size="md" />
          </Link>
          <button
            type="button"
            onClick={toggleDarkMode}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--fn-surface-muted)] text-[var(--fn-text-muted)] transition hover:bg-[var(--fn-border)]"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col px-6 py-12 md:py-16">
        <div className="fn-layout-form">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold md:text-4xl">{ADMIN_LABELS.login.title}</h1>
            <p className="mt-3 text-lg text-[var(--fn-text-muted)]">{ADMIN_LABELS.login.subtitle}</p>
          </div>

          <div className="mt-10 space-y-4">
            <Input
              label={AUTH_LABELS.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <Input
              label={AUTH_LABELS.password}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {error && <p className="text-sm text-[var(--fn-error)]">{error}</p>}
            <Button
              title={ADMIN_LABELS.login.signIn}
              loading={loading}
              className="w-full"
              onClick={handleLogin}
            />
          </div>

          <p className="mt-10 text-center text-sm">
            <Link href="/auth/login" className="font-medium text-[var(--fn-primary)]">
              {ADMIN_LABELS.login.backToApp}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
