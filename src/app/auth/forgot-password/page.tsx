'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';
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
    <div className="mx-auto min-h-screen max-w-md px-6 py-12">
      <PageHeader title={GENERAL_LABELS.resetPassword} showBack backHref="/auth/login" />
      {sent ? (
        <div className="mt-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">{GENERAL_LABELS.checkYourEmail}</h2>
          <p className="text-[var(--fn-text-muted)] text-center">
            {GENERAL_LABELS.ifAccountExists} <span className="font-semibold">{email}</span>, {GENERAL_LABELS.willReceiveResetInstructions}
          </p>
        </div>
      ) : (
        <>
          <p className="mt-4 mb-6 text-[var(--fn-text-muted)]">{GENERAL_LABELS.enterYourEmail}</p>
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
            className="mt-6 w-full"
          />
        </>
      )}
      <Link href="/auth/login" className="mt-8 block text-center text-sm text-[var(--fn-primary)] font-medium">
        {GENERAL_LABELS.backToSignIn}
      </Link>
    </div>
  );
}
