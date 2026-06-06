'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/layout/Logo';

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
      <div className="mx-auto w-full max-w-md text-center">
        <Logo size="lg" className="mb-6" />
        <h2 className="text-4xl font-extrabold text-[var(--fn-text)]">Something went wrong!</h2>
        <p className="mt-4 text-lg text-[var(--fn-text-muted)]">
          We're sorry, but there was an error loading this page.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-xl bg-[var(--fn-primary)] px-8 py-3 text-base font-semibold text-white transition-all hover:opacity-90"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] px-8 py-3 text-base font-semibold text-[var(--fn-text)] transition-all hover:bg-[var(--fn-surface-muted)]"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}
