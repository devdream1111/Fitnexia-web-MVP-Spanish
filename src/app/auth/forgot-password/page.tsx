'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto min-h-screen max-w-md px-6 py-12">
      <PageHeader title="Reset password" showBack backHref="/auth/login" />
      {sent ? (
        <p className="text-[var(--fn-text-muted)]">
          If an account exists for {email}, you will receive reset instructions (mock).
        </p>
      ) : (
        <>
          <p className="mb-6 text-[var(--fn-text-muted)]">Enter your email and we will send a reset link.</p>
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          <Button title="Send reset link" onClick={() => setSent(true)} />
        </>
      )}
      <Link href="/auth/login" className="mt-6 block text-center text-sm text-[var(--fn-primary)]">
        Back to sign in
      </Link>
    </div>
  );
}
