'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  showBack,
  backHref,
  action,
  variant = 'default',
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  showBack?: boolean;
  backHref?: string;
  action?: React.ReactNode;
  /** `premium` — gradient wash used on athlete secondary pages */
  variant?: 'default' | 'premium';
}) {
  const router = useRouter();

  const backControl = showBack ? (
    backHref ? (
      <Link
        href={backHref}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] text-[var(--fn-text-muted)] transition hover:border-[var(--fn-primary)]/40 hover:text-[var(--fn-text)]"
        aria-label="Volver"
      >
        <ArrowLeft size={18} strokeWidth={2.25} />
      </Link>
    ) : (
      <button
        type="button"
        onClick={() => router.back()}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] text-[var(--fn-text-muted)] transition hover:border-[var(--fn-primary)]/40 hover:text-[var(--fn-text)]"
        aria-label="Volver"
      >
        <ArrowLeft size={18} strokeWidth={2.25} />
      </button>
    )
  ) : null;

  if (variant === 'premium') {
    return (
      <header className="relative mb-8 overflow-hidden rounded-[1.5rem] border border-[color-mix(in_srgb,var(--fn-primary)_22%,var(--fn-border))] bg-gradient-to-br from-[var(--fn-surface)] via-[color-mix(in_srgb,var(--fn-primary-muted)_35%,var(--fn-surface))] to-[var(--fn-surface)] px-5 py-5 shadow-[0_12px_32px_-24px_color-mix(in_srgb,var(--fn-primary)_50%,transparent)] md:rounded-[1.75rem] md:px-7 md:py-6">
        <div
          className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-[var(--fn-primary)]/10 blur-2xl"
          aria-hidden="true"
        />
        <div className="relative flex items-start gap-3 sm:items-center">
          {backControl}
          <div className="min-w-0 flex-1">
            {eyebrow ? (
              <p className="m-0 text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-[var(--fn-primary-text)]">
                {eyebrow}
              </p>
            ) : null}
            <h1
              className={`m-0 text-2xl font-extrabold tracking-tight text-[var(--fn-text)] md:text-3xl ${
                eyebrow ? 'mt-1' : ''
              }`}
            >
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-1.5 m-0 max-w-2xl text-sm leading-relaxed text-[var(--fn-text-muted)]">
                {subtitle}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </header>
    );
  }

  return (
    <header className="mb-6 flex items-center gap-3">
      {backControl}
      <div className="min-w-0 flex-1">
        <h1 className="m-0 text-xl font-bold tracking-tight text-[var(--fn-text)] md:text-2xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-0.5 m-0 text-sm text-[var(--fn-text-muted)]">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
