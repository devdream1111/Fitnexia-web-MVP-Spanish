'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  AuthDivider,
  AuthFooterLink,
  AuthFormHeader,
  AuthFormIntro,
  AuthShell,
  DemoAccessPanel,
  GoogleSignInButton,
  PasswordInput,
} from '@/components/auth/auth-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { AUTH_LABELS, BUTTON_LABELS, GENERAL_LABELS } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';
import type { UserRole } from '@/types/api';

export default function LoginPage() {
  const router = useRouter();
  const googleSignIn = useFeature('googleSignIn');
  const { login } = useAuth();
  const [email, setEmail] = useState('demo@fitnexia.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);

  const homeForRole = (role: UserRole = 'athlete') => {
    if (role === 'instructor') return '/instructor/dashboard';
    if (role === 'institution') return '/gym/dashboard';
    return '/athlete/home';
  };

  const handleLogin = async (role?: UserRole) => {
    setLoading(true);
    try {
      const resolvedRole = role ?? 'athlete';
      await login(email, password, resolvedRole);
      router.replace(homeForRole(resolvedRole));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell variant="login">
      <AuthFormIntro>
        <AuthFormHeader title={BUTTON_LABELS.signIn} subtitle={AUTH_LABELS.signInSubtitle} />

        {googleSignIn ? (
          <>
            <GoogleSignInButton
              label={`${GENERAL_LABELS.continueWith} ${GENERAL_LABELS.google}`}
              onClick={() => alert('Inicio de sesión con Google — conecta cuando el backend esté listo.')}
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
          onClick={() => handleLogin()}
        />
      </div>

      <DemoAccessPanel onDemoLogin={handleLogin} />

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
