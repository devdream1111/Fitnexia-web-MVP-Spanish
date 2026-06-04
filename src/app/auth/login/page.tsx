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
    <div className="mx-auto min-h-screen max-w-md px-6 py-12">
      <p className="text-2xl font-extrabold text-[var(--fn-primary)]">Fitnexia</p>
      <h1 className="mt-6 text-3xl font-extrabold">{AUTH_LABELS.welcomeBack}</h1>
      <p className="mt-2 text-[var(--fn-text-muted)]">{AUTH_LABELS.signInSubtitle}</p>

      <div className="mt-8">
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
        <Button title={BUTTON_LABELS.signIn} loading={loading} className="mt-6" onClick={() => handleLogin()} />
      </div>

      {googleSignIn ? (
        <Button
          title="Continue with Google"
          variant="outline"
          className="mt-4"
          onClick={() => alert('Google Sign-In — connect when backend is ready.')}
        />
      ) : null}

      <p className="mt-8 text-center text-sm text-[var(--fn-text-muted)]">Quick demo (mock)</p>
      <div className="mt-3 flex gap-2">
        <Button title="Athlete" variant="outline" size="sm" onClick={() => handleLogin('athlete')} />
        <Button title="Coach" variant="outline" size="sm" onClick={() => handleLogin('instructor')} />
        <Button title="Gym" variant="outline" size="sm" onClick={() => handleLogin('institution')} />
      </div>

      <p className="mt-8 text-center text-sm">
        New here?{' '}
        <Link href="/auth/register" className="font-semibold text-[var(--fn-primary)]">
          Create account
        </Link>
      </p>
    </div>
  );
}
