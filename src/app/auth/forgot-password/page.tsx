'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

import { AuthFormHeader, AuthFormIntro, AuthShell } from '@/components/auth/auth-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GENERAL_LABELS, AUTH_LABELS } from '@/constants/labels';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1000);
  };

  return (
    <AuthShell variant="login">
      <AuthFormIntro>
        <AuthFormHeader
          title={GENERAL_LABELS.resetPassword}
          subtitle={sent ? GENERAL_LABELS.checkYourEmail : GENERAL_LABELS.enterYourEmail}
        />
      </AuthFormIntro>

      {sent ? (
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--fn-primary-muted)]">
            <CheckCircle2 size={28} className="text-[var(--fn-primary)]" />
          </div>
          <p className="text-sm leading-relaxed text-[var(--fn-text-muted)]">
            {GENERAL_LABELS.ifAccountExists}{' '}
            <span className="font-semibold text-[var(--fn-text)]">{email}</span>,{' '}
            {GENERAL_LABELS.willReceiveResetInstructions}
          </p>
        </div>
      ) : (
        <div className="fn-auth-form-fields">
          <Input
            label={AUTH_LABELS.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="tu@ejemplo.com"
          />
          <Button
            title={GENERAL_LABELS.sendResetLink}
            onClick={handleSubmit}
            loading={loading}
            className="w-full"
            size="md"
          />
        </div>
      )}

      <div className="mt-6">
        <Link
          href="/auth/login"
          className="block text-center text-sm font-semibold text-[var(--fn-primary)] transition hover:opacity-80"
        >
          {GENERAL_LABELS.backToSignIn}
        </Link>
      </div>
    </AuthShell>
  );
}
