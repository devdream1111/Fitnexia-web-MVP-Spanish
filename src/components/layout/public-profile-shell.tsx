'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Logo } from '@/components/layout/Logo';
import { PAGE_BACKGROUNDS } from '@/constants/backgrounds';
import { GENERAL_LABELS } from '@/constants/labels';
import { useAppTheme } from '@/contexts/theme-context';

export function PublicProfileShell({
  children,
  backHref = '/',
  backLabel = GENERAL_LABELS.back,
  onBack,
}: {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  onBack?: () => void;
}) {
  const { isDark } = useAppTheme();

  const backControl = onBack ? (
    <button
      type="button"
      onClick={onBack}
      className="fn-profile-chrome-back inline-flex items-center gap-2 rounded-full border border-[var(--fn-border)] bg-[var(--fn-surface)]/92 px-3 py-1.5 text-sm font-semibold text-[var(--fn-text-secondary)] shadow-sm backdrop-blur-sm transition hover:border-[color-mix(in_srgb,var(--fn-primary)_35%,var(--fn-border))] hover:text-[var(--fn-primary-text)]"
    >
      <ArrowLeft size={15} strokeWidth={2.25} />
      {backLabel}
    </button>
  ) : (
    <Link
      href={backHref}
      className="fn-profile-chrome-back inline-flex items-center gap-2 rounded-full border border-[var(--fn-border)] bg-[var(--fn-surface)]/92 px-3 py-1.5 text-sm font-semibold text-[var(--fn-text-secondary)] shadow-sm backdrop-blur-sm transition hover:border-[color-mix(in_srgb,var(--fn-primary)_35%,var(--fn-border))] hover:text-[var(--fn-primary-text)]"
    >
      <ArrowLeft size={15} strokeWidth={2.25} />
      {backLabel}
    </Link>
  );

  return (
    <div className="fn-profile-chrome relative min-h-screen">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-fixed opacity-[0.11]"
        style={{ backgroundImage: `url(${isDark ? PAGE_BACKGROUNDS.dark : PAGE_BACKGROUNDS.light})` }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--fn-primary-muted)]/35 via-[var(--fn-bg)]/88 to-[var(--fn-bg)]"
        aria-hidden="true"
      />

      <div className="fn-layout-shell relative pb-10 pt-4 md:pb-12 md:pt-5">
        <div className="mb-4 flex items-center justify-between gap-3" style={{maxWidth: '88rem', marginLeft: 'auto', marginRight: 'auto'}}>
          <Link href="/" className="shrink-0 rounded-xl p-1 transition hover:opacity-85" aria-label="Fitnexia">
            <Logo size="sm" />
          </Link>
          {backControl}
        </div>
        {children}
      </div>
    </div>
  );
}
