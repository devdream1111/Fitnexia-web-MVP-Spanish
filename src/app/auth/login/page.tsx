'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Logo } from '@/components/layout/Logo';
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
        <div className="text-center animate-bounce-in">
          <Link href="/" className="inline-block mb-1">
            <Logo size="lg" className="mx-auto" />
          </Link>
          
        </div>

        <div className="mt-10 space-y-4 animate-slide-up stagger-1">
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
          <Button 
            title={BUTTON_LABELS.signIn} 
            loading={loading} 
            className="w-full hover:animate-pulse-glow" 
            onClick={() => handleLogin()} 
          />
        </div>

        {googleSignIn ? (
          <div className="mt-6 animate-slide-up stagger-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                {/* <div className="w-full border-t border-[var(--fn-border)]" /> */}
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 text-[var(--fn-text-muted)]">or continue with</span>
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

        <div className="mt-10 animate-slide-up stagger-3">
          <p className="text-center text-sm font-medium text-[var(--fn-text-muted)]">Quick demo (mock)</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Button title="Athlete" variant="outline" onClick={() => handleLogin('athlete')} />
            <Button title="Coach" variant="outline" onClick={() => handleLogin('instructor')} />
            <Button title="Gym" variant="outline" onClick={() => handleLogin('institution')} />
          </div>
        </div>

        <p className="mt-10 text-center text-base animate-slide-up stagger-4">
          New here?{' '}
          <Link href="/auth/register" className="font-semibold text-[var(--fn-primary)]">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
