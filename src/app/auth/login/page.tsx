'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { AUTH_LABELS, BUTTON_LABELS } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';
import type { UserRole } from '@/types/api';

export default function LoginPage() {
  const router = useRouter();
  const googleSignIn = useFeature('googleSignIn');
  const { login } = useAuth();
  const [email, setEmail] = useState('demo@fitnexia.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (role?: UserRole) => {
    setLoading(true);
    try {
      await login(email, password, role);
      router.replace('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <img src="/fitnexia-logo.svg" alt="Fitnexia Logo" className="h-14 w-auto" />
          </Link>
          <h1 className="mt-8 text-3xl font-extrabold md:text-4xl">{AUTH_LABELS.welcomeBack}</h1>
          <p className="mt-3 text-lg text-[var(--fn-text-muted)]">{AUTH_LABELS.signInSubtitle}</p>
        </div>

        <div className="mt-10 space-y-4">
          <Input label={AUTH_LABELS.email} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <Input
            label={AUTH_LABELS.password}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Link href="/auth/forgot-password" className="text-sm font-medium text-[var(--fn-primary)]">
            Forgot password?
          </Link>
          <Button title={BUTTON_LABELS.signIn} loading={loading} className="w-full" onClick={() => handleLogin()} />
        </div>

        {googleSignIn ? (
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--fn-border)]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[var(--fn-surface)] text-[var(--fn-text-muted)]">or continue with</span>
              </div>
            </div>
            <Button
              title="Google"
              variant="outline"
              className="mt-6 w-full"
              onClick={() => alert('Google Sign-In — connect when backend is ready.')}
            />
          </div>
        ) : null}

        <div className="mt-10">
          <p className="text-center text-sm font-medium text-[var(--fn-text-muted)]">Quick demo (mock)</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Button title="Athlete" variant="outline" onClick={() => handleLogin('athlete')} />
            <Button title="Coach" variant="outline" onClick={() => handleLogin('instructor')} />
            <Button title="Gym" variant="outline" onClick={() => handleLogin('institution')} />
          </div>
        </div>

        <p className="mt-10 text-center text-base">
          New here?{' '}
          <Link href="/auth/register" className="font-semibold text-[var(--fn-primary)]">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
