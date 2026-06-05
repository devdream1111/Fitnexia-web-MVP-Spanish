'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';

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
      <PageHeader title="Reset password" showBack backHref="/auth/login" />
      {sent ? (
        <div className="mt-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">Check your email</h2>
          <p className="text-[var(--fn-text-muted)] text-center">
            If an account exists for <span className="font-semibold">{email}</span>, you will receive reset instructions (mock).
          </p>
        </div>
      ) : (
        <>
          <p className="mt-4 mb-6 text-[var(--fn-text-muted)]">Enter your email and we will send a reset link.</p>
          <Input 
            label="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            type="email" 
            placeholder="you@example.com"
          />
          <Button 
            title="Send reset link" 
            onClick={handleSubmit} 
            loading={loading}
            className="mt-6 w-full"
          />
        </>
      )}
      <Link href="/auth/login" className="mt-8 block text-center text-sm text-[var(--fn-primary)] font-medium">
        Back to sign in
      </Link>
    </div>
  );
}
