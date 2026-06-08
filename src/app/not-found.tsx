'use client';

import Link from 'next/link';
import { Logo } from '@/components/layout/Logo';
import { GENERAL_LABELS } from '@/constants/labels';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-md text-center">
        <Logo size="lg" className="mb-6" />
        <h2 className="text-4xl font-extrabold text-[var(--fn-text)]">404</h2>
        <p className="mt-4 text-lg text-[var(--fn-text-muted)]">
          {GENERAL_LABELS.pageDoesNotExist}
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-[var(--fn-primary)] px-8 py-3 text-base font-semibold text-white transition-all hover:opacity-90"
        >
          {GENERAL_LABELS.goBackHome}
        </Link>
      </div>
    </div>
  );
}
