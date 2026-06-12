'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import {
  AuthDivider,
  AuthFooterLink,
  AuthFormHeader,
  AuthFormIntro,
  AuthShell,
  GoogleSignInButton,
  PasswordInput,
} from '@/components/auth/auth-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAuthErrorMessage, useAuth } from '@/contexts/auth-context';
import { AUTH_LABELS, BUTTON_LABELS, GENERAL_LABELS } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';
import type { UserRole } from '@/types/api';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const googleSignInEnabled = useFeature('googleSignIn');
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const googleError = searchParams.get('googleError');
    if (googleError) setError(googleError);
  }, [searchParams]);

  const homeForRole = (role: UserRole = 'athlete') => {
    if (role === 'instructor') return '/instructor/dashboard';
    if (role === 'institution') return '/gym/dashboard';
    return '/athlete/home';
  };

  const startGoogleLogin = () => {
    setGoogleLoading(true);
    window.location.href = '/api/auth/google?mode=login';
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const loggedIn = await login(email, password);
      router.replace(homeForRole(loggedIn.role));
    } catch (e) {
      setError(getAuthErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell variant="login">
      <AuthFormIntro>
        <AuthFormHeader title={BUTTON_LABELS.signIn} subtitle={AUTH_LABELS.signInSubtitle} />

        {googleSignInEnabled ? (
          <>
            <GoogleSignInButton
              label={`${GENERAL_LABELS.continueWith} ${GENERAL_LABELS.google}`}
              onClick={startGoogleLogin}
              loading={googleLoading}
            />
            <AuthDivider label={GENERAL_LABELS.orContinueWith} />
          </>
        ) : null}
      </AuthFormIntro>

      <div className="fn-auth-form-fields">
        <Input
          label={AUTH_LABELS.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="tu@ejemplo.com"
        />
        <PasswordInput
          label={AUTH_LABELS.password}
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
        {error ? <p className="text-sm text-[var(--fn-error)]">{error}</p> : null}
        <div className="flex justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-sm font-medium text-[var(--fn-primary)] transition hover:opacity-80"
          >
            {GENERAL_LABELS.forgotPassword}
          </Link>
        </div>
        <Button
          title={BUTTON_LABELS.signIn}
          loading={loading}
          className="w-full"
          size="md"
          onClick={handleLogin}
        />
      </div>

      <div className="mt-6">
        <AuthFooterLink
          prompt={GENERAL_LABELS.newHere}
          linkLabel={BUTTON_LABELS.createAccount}
          href="/auth/register"
        />
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
