'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export const PROFILE_EXPERIENCE_GRADIENT =
  'from-[#1a73e8] via-[#1967d2] to-[#0d47a1]';

export function profileExperienceDelay(index: number): React.CSSProperties {
  return { animationDelay: `${Math.min(index, 8) * 40}ms` };
}

export function ProfileExperiencePage({ children }: { children: ReactNode }) {
  return <div className="fn-profile-experience mx-auto w-full max-w-[88rem]">{children}</div>;
}

export function ProfileExperienceHero({
  children,
  footer,
}: {
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section
      className={`fn-profile-experience-hero relative overflow-hidden rounded-[1.35rem] bg-gradient-to-br ${PROFILE_EXPERIENCE_GRADIENT} shadow-[0_20px_48px_-26px_color-mix(in_srgb,var(--fn-primary)_70%,transparent)]`}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/18 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-sky-300/18 blur-3xl" />
      </div>
      <div className="relative px-5 py-6 md:px-8 md:py-7">{children}</div>
      {footer ? (
        <div className="relative border-t border-white/15 bg-black/10 px-5 py-3 md:px-8">{footer}</div>
      ) : null}
    </section>
  );
}

export function ProfileExperienceInlineStats({
  stats,
}: {
  stats: { label: string; value: ReactNode; icon?: LucideIcon }[];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            style={profileExperienceDelay(index + 1)}
            className="rounded-xl bg-white/12 px-3 py-2.5 backdrop-blur-sm ring-1 ring-white/15 animate-[fn-home-fade-up_0.45s_ease-out_both]"
          >
            <div className="flex items-center gap-2">
              {Icon ? <Icon size={14} className="shrink-0 text-white/85" strokeWidth={2.25} /> : null}
              <p className="m-0 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-white/70">
                {stat.label}
              </p>
            </div>
            <p className="mt-1 m-0 text-lg font-extrabold tabular-nums text-white">{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
}

export function ProfileExperienceOverviewGrid({ children }: { children: ReactNode }) {
  return (
    <div className="fn-profile-experience-overview mt-4 grid gap-3 lg:grid-cols-3">
      {children}
    </div>
  );
}

export function ProfileExperienceOverviewCard({
  title,
  icon: Icon,
  children,
  index = 0,
  className = '',
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <article
      style={profileExperienceDelay(index + 2)}
      className={`fn-profile-experience-overview-card rounded-[1.1rem] border border-[color-mix(in_srgb,var(--fn-primary)_16%,var(--fn-border))] bg-[color-mix(in_srgb,var(--fn-surface)_92%,transparent)] p-4 shadow-[0_10px_28px_-22px_rgba(15,23,42,0.35)] backdrop-blur-sm animate-[fn-home-fade-up_0.45s_ease-out_both] md:p-5 ${className}`}
    >
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]">
          <Icon size={15} strokeWidth={2.25} />
        </span>
        <h2 className="m-0 text-sm font-extrabold tracking-tight text-[var(--fn-text)]">{title}</h2>
      </div>
      {children}
    </article>
  );
}

export function ProfileExperienceBody({
  main,
  aside,
}: {
  main: ReactNode;
  aside?: ReactNode;
}) {
  return (
    // xl:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] grid
    <div className="mt-6 gap-5 xl:items-start">
      <div className="space-y-4 md:space-y-5">{main}</div>
      {aside ? (
        <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">{aside}</aside>
      ) : null}
    </div>
  );
}

export function ProfileExperienceSection({
  title,
  icon: Icon,
  eyebrow,
  children,
  index = 0,
  className = '',
  compact = false,
}: {
  title: string;
  icon: LucideIcon;
  eyebrow?: string;
  children: ReactNode;
  index?: number;
  className?: string;
  compact?: boolean;
}) {
  return (
    <section
      style={profileExperienceDelay(index + 4)}
      className={`fn-profile-experience-section overflow-hidden rounded-[1.1rem] border border-[var(--fn-border)] bg-[color-mix(in_srgb,var(--fn-surface)_94%,transparent)] shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur-sm animate-[fn-home-fade-up_0.45s_ease-out_both] ${className}`}
    >
      <header className="flex items-center gap-3 border-b border-[var(--fn-border)] bg-[color-mix(in_srgb,var(--fn-primary-muted)_40%,var(--fn-surface))] px-4 py-3 md:px-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--fn-primary)] text-white">
          <Icon size={16} strokeWidth={2.25} />
        </span>
        <div className="min-w-0">
          {eyebrow ? (
            <p className="m-0 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-[var(--fn-primary-text)]">
              {eyebrow}
            </p>
          ) : null}
          <h2 className={`m-0 text-sm font-extrabold tracking-tight text-[var(--fn-text)] md:text-base ${eyebrow ? 'mt-0.5' : ''}`}>
            {title}
          </h2>
        </div>
      </header>
      <div className={compact ? 'p-4 md:p-5' : 'p-4 md:p-5 lg:p-6'}>{children}</div>
    </section>
  );
}

export function ProfileExperienceAsideCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[1.1rem] border border-[color-mix(in_srgb,var(--fn-primary)_14%,var(--fn-border))] bg-[color-mix(in_srgb,var(--fn-surface)_94%,transparent)] p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur-sm">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]">
          <Icon size={15} strokeWidth={2.25} />
        </span>
        <h3 className="m-0 text-sm font-extrabold text-[var(--fn-text)]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export function ProfileExperienceChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--fn-primary)_20%,var(--fn-border))] bg-[var(--fn-primary-muted)]/55 px-3 py-1 text-xs font-semibold text-[var(--fn-primary-text)] sm:text-sm">
      {children}
    </span>
  );
}

export function ProfileExperienceContactCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <div className="flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--fn-primary)_12%,var(--fn-border))] bg-[color-mix(in_srgb,var(--fn-primary-muted)_24%,var(--fn-surface))] p-3.5 transition hover:border-[color-mix(in_srgb,var(--fn-primary)_28%,var(--fn-border))]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--fn-primary)] text-white">
        <Icon size={15} strokeWidth={2.25} />
      </span>
      <div className="min-w-0">
        <p className="m-0 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-[var(--fn-text-muted)]">
          {label}
        </p>
        <p className="mt-0.5 break-words text-sm font-semibold leading-snug text-[var(--fn-text)]">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {inner}
      </a>
    );
  }
  return inner;
}

export function ProfileExperienceCertCard({
  name,
  issuer,
  year,
}: {
  name: string;
  issuer: string;
  year: number;
}) {
  return (
    <article className="flex gap-3 rounded-xl border border-[color-mix(in_srgb,var(--fn-primary)_12%,var(--fn-border))] bg-[color-mix(in_srgb,var(--fn-primary-muted)_26%,var(--fn-surface))] p-3.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--fn-primary)] text-xs font-black text-white">
        {String(year).slice(-2)}
      </span>
      <div className="min-w-0">
        <p className="m-0 text-sm font-bold text-[var(--fn-text)]">{name}</p>
        <p className="mt-0.5 text-xs text-[var(--fn-text-muted)]">{issuer}</p>
        <p className="mt-0.5 text-[0.6875rem] font-bold text-[var(--fn-primary-text)]">{year}</p>
      </div>
    </article>
  );
}

export function ProfileExperienceAvailability({
  available,
  availableLabel,
  unavailableLabel,
}: {
  available: boolean;
  availableLabel: string;
  unavailableLabel: string;
}) {
  return (
    <div
      className={`inline-flex w-full items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-bold ${
        available
          ? 'bg-[var(--fn-primary-muted)] text-[var(--fn-primary-text)] ring-1 ring-[color-mix(in_srgb,var(--fn-primary)_22%,transparent)]'
          : 'bg-[var(--fn-surface-muted)] text-[var(--fn-text-muted)]'
      }`}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {available ? (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--fn-primary)] opacity-35" />
        ) : null}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            available ? 'bg-[var(--fn-primary)]' : 'bg-[var(--fn-text-muted)]'
          }`}
        />
      </span>
      {available ? availableLabel : unavailableLabel}
    </div>
  );
}

export function ProfileExperiencePreviewText({
  text,
  empty,
}: {
  text?: string | null;
  empty: string;
}) {
  const value = text?.trim();
  return (
    <p className={`m-0 text-sm leading-relaxed text-[var(--fn-text-secondary)] ${value ? 'line-clamp-4' : 'italic text-[var(--fn-text-muted)]'}`}>
      {value || empty}
    </p>
  );
}
