'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/layout/Logo';
import { GENERAL_LABELS } from '@/constants/labels';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-screen flex-col justify-center px-6 py-12">
      <div className="fn-layout-form text-center">
        <Logo size="lg" className="mb-6" />
        <h2 className="text-4xl font-extrabold text-[var(--fn-text)]">{GENERAL_LABELS.somethingWentWrong}</h2>
        <p className="mt-4 text-lg text-[var(--fn-text-muted)]">
          {GENERAL_LABELS.weAreSorryError}
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-xl bg-[var(--fn-primary)] px-8 py-3 text-base font-semibold text-white transition-all hover:opacity-90"
          >
            {GENERAL_LABELS.tryAgain}
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] px-8 py-3 text-base font-semibold text-[var(--fn-text)] transition-all hover:bg-[var(--fn-surface-muted)]"
          >
            {GENERAL_LABELS.goBackHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
