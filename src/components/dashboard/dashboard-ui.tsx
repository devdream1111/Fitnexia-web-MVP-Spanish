'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export const DASHBOARD_GRADIENTS = {
  athlete: 'from-[var(--fn-primary)] via-[#1d4ed8] to-[#312e81]',
  instructor: 'from-emerald-600 via-[#2563eb] to-indigo-900',
  gym: 'from-violet-600 via-[#2563eb] to-slate-900',
} as const;

export type DashboardRole = keyof typeof DASHBOARD_GRADIENTS;

export function DashboardHero({
  eyebrow,
  title,
  gradient,
  children,
}: {
  eyebrow: string;
  title: string;
  gradient: string;
  children?: ReactNode;
}) {
  return (
    <section className={`fn-dashboard-hero relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} px-6 py-8 md:px-10 md:py-10`}>
      <div className="pointer-events-none absolute inset-0 opacity-25" aria-hidden="true">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute right-1/3 top-1/2 h-24 w-24 rounded-full bg-cyan-300/20 blur-xl" />
      </div>
      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-white/75">{eyebrow}</p>
          <h1 className="max-w-2xl text-3xl font-extrabold leading-tight text-white md:text-4xl">{title}</h1>
        </div>
        {children ? <div className="shrink-0">{children}</div> : null}
      </div>
    </section>
  );
}

export function DashboardSearchLink({
  href,
  children,
  icon,
}: {
  href: string;
  children: ReactNode;
  icon: ReactNode;
}) {
  return (
    <Link href={href} className="fn-dashboard-search group">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--fn-primary-muted)] text-[var(--fn-primary)] transition group-hover:bg-[var(--fn-primary)] group-hover:text-white">
        {icon}
      </span>
      <span className="text-base font-medium text-[var(--fn-text-muted)] transition group-hover:text-[var(--fn-text)] md:text-lg">
        {children}
      </span>
    </Link>
  );
}

export function DashboardStatCard({
  label,
  value,
  icon: Icon,
  accent = 'primary',
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: 'primary' | 'emerald' | 'violet' | 'amber';
}) {
  const accents = {
    primary: {
      ring: 'ring-[var(--fn-primary)]/15',
      iconBg: 'bg-[var(--fn-primary-muted)]',
      iconText: 'text-[var(--fn-primary)]',
      glow: 'from-[var(--fn-primary)]/8',
    },
    emerald: {
      ring: 'ring-emerald-500/15',
      iconBg: 'bg-emerald-500/15',
      iconText: 'text-emerald-600 dark:text-emerald-400',
      glow: 'from-emerald-500/10',
    },
    violet: {
      ring: 'ring-violet-500/15',
      iconBg: 'bg-violet-500/15',
      iconText: 'text-violet-600 dark:text-violet-400',
      glow: 'from-violet-500/10',
    },
    amber: {
      ring: 'ring-amber-500/15',
      iconBg: 'bg-amber-500/15',
      iconText: 'text-amber-600 dark:text-amber-400',
      glow: 'from-amber-500/10',
    },
  }[accent];

  return (
    <div className={`fn-dashboard-stat group relative overflow-hidden rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5 ring-1 ${accents.ring} transition hover:-translate-y-0.5 hover:shadow-lg`}>
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accents.glow} to-transparent opacity-0 transition group-hover:opacity-100`}
        aria-hidden="true"
      />
      <div className="relative flex items-center gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accents.iconBg}`}>
          <Icon size={22} className={accents.iconText} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[var(--fn-text-muted)]">{label}</p>
          <p className="mt-0.5 text-2xl font-extrabold tracking-tight text-[var(--fn-text)] md:text-3xl">{value}</p>
        </div>
      </div>
    </div>
  );
}

export function DashboardSection({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="fn-dashboard-section space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold tracking-tight text-[var(--fn-text)] md:text-2xl">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function DashboardClassGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

export function DashboardPage({ children }: { children: ReactNode }) {
  return <div className="fn-dashboard-page space-y-8 md:space-y-10">{children}</div>;
}
