'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  Clock,
  Dumbbell,
  LayoutGrid,
  ListFilter,
  MapPin,
  Search,
  Sparkles,
  Users,
  Video,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { RegularClassBadge } from '@/components/regular-class-badge';
import {
  BADGE_LABELS,
  BUTTON_LABELS,
  CLASS_CARD_LABELS,
  GENERAL_LABELS,
  modalityLocationLabel,
} from '@/constants/labels';
import { formatClassDate, formatMoney } from '@/utils/format';
import { classHostLabel } from '@/utils/class-instructor';
import { hostIsVerified } from '@/utils/verification';
import type { ClassListItem } from '@/types/api';

type SectionIcon = 'nearby' | 'recommended' | 'recurring' | 'general';
type SectionVariant = 'default' | 'feed';

export function AthleteHomeShell({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-8 pb-6 md:gap-10">{children}</div>;
}

export type AthleteHomeViewMode = 'byType' | 'byFeed';

const VIEW_MODE_OPTIONS: {
  id: AthleteHomeViewMode;
  label: string;
  description: string;
  icon: typeof ListFilter;
}[] = [
  {
    id: 'byType',
    label: GENERAL_LABELS.athleteHomeViewByType,
    description: GENERAL_LABELS.athleteHomeViewByTypeDesc,
    icon: ListFilter,
  },
  {
    id: 'byFeed',
    label: GENERAL_LABELS.athleteHomeViewByFeed,
    description: GENERAL_LABELS.athleteHomeViewByFeedDesc,
    icon: LayoutGrid,
  },
];

export function AthleteHomeDiscoverPanel({
  viewMode,
  onViewModeChange,
  children,
}: {
  viewMode: AthleteHomeViewMode;
  onViewModeChange: (value: AthleteHomeViewMode) => void;
  children: ReactNode;
}) {
  const isFeed = viewMode === 'byFeed';

  return (
    <div className="fn-athlete-home-discover flex flex-col gap-6 md:gap-8">
      <section className="fn-athlete-home-toolbar">
        <div className="fn-athlete-home-toolbar-inner">
          <header className="fn-athlete-home-toolbar-head">
            <p className="m-0 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[var(--fn-primary-text)]">
              {GENERAL_LABELS.athleteHomeViewLabel}
            </p>
            <p className="mt-1.5 m-0 text-sm leading-relaxed text-[var(--fn-text-muted)] md:text-[0.9375rem]">
              {GENERAL_LABELS.athleteHomeViewHint}
            </p>
          </header>

          <div
            className="fn-athlete-home-mode-grid"
            role="tablist"
            aria-label={GENERAL_LABELS.athleteHomeViewLabel}
          >
            {VIEW_MODE_OPTIONS.map((option) => {
              const active = viewMode === option.id;
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onViewModeChange(option.id)}
                  className="fn-athlete-home-mode-option group flex min-w-0 items-center gap-3 px-3.5 py-3 text-left md:px-4 md:py-3.5"
                >
                  <span
                    className={[
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition',
                      active
                        ? 'bg-[var(--fn-primary)] text-white shadow-sm'
                        : 'bg-[var(--fn-surface-muted)] text-[var(--fn-text-muted)] group-hover:text-[var(--fn-primary-text)]',
                    ].join(' ')}
                  >
                    <Icon size={18} strokeWidth={2.25} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={[
                        'block text-sm font-bold leading-tight',
                        active ? 'text-[var(--fn-primary-text)]' : 'text-[var(--fn-text)]',
                      ].join(' ')}
                    >
                      {option.label}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-[var(--fn-text-muted)]">
                      {option.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div
        key={viewMode}
        className={[
          'fn-athlete-home-mode-content flex flex-col gap-8 md:gap-10',
          isFeed ? 'fn-athlete-home-feed-panel px-4 py-5 md:px-6 md:py-6' : '',
        ].join(' ')}
      >
        {isFeed ? (
          <p className="m-0 inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--fn-primary-muted)] px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-[var(--fn-primary-text)] ring-1 ring-[color-mix(in_srgb,var(--fn-primary)_22%,transparent)]">
            <Sparkles size={12} strokeWidth={2.5} />
            {GENERAL_LABELS.athleteHomeFeedEyebrow}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}

export function AthleteHomeHero({ eyebrow, title }: { eyebrow: string; title: string }) {
  const titleWords = title.split(' ');
  const lead = titleWords.slice(0, -2).join(' ');
  const punch = titleWords.slice(-2).join(' ');

  return (
    <header className="relative overflow-hidden rounded-[1.75rem] border border-[color-mix(in_srgb,var(--fn-primary)_28%,var(--fn-border))] bg-gradient-to-br from-[var(--fn-primary)] via-[#1d4ed8] to-[#0f172a] px-6 py-8 text-white shadow-[0_24px_48px_-28px_rgba(37,99,235,0.65)] md:rounded-[2rem] md:px-10 md:py-11">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 88% 12%, rgba(255,255,255,0.32), transparent 40%), radial-gradient(circle at 8% 92%, rgba(56,189,248,0.35), transparent 42%), radial-gradient(circle at 50% 50%, transparent 55%, rgba(15,23,42,0.35) 100%)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-10 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full border border-white/10 bg-white/5 blur-0"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-cyan-300/20 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-white/85 ring-1 ring-white/20 backdrop-blur-sm">
            <Sparkles size={13} strokeWidth={2.5} />
            {eyebrow}
          </div>
          <h1 className="mt-4 leading-[0.95] tracking-tight">
            {lead ? (
              <>
                <span className="block text-[clamp(1.75rem,4.5vw,2.75rem)] font-medium text-white/75">
                  {lead}
                </span>
                <span className="mt-[0.12em] block text-[clamp(2.35rem,6.5vw,4rem)] font-black text-white">
                  {punch}
                </span>
              </>
            ) : (
              <span className="block text-[clamp(2.35rem,6.5vw,4rem)] font-black text-white">
                {title}
              </span>
            )}
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/75 md:text-base">
            {GENERAL_LABELS.athleteHomeHeroBody}
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[15rem]">
          <Link
            href="/athlete/search"
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-[var(--fn-primary-text)] shadow-lg shadow-black/10 transition hover:bg-white/95 hover:shadow-xl"
          >
            <Search size={16} strokeWidth={2.5} />
            {GENERAL_LABELS.athleteHomeSearchCta}
            <ArrowRight
              size={16}
              strokeWidth={2.5}
              className="transition group-hover:translate-x-0.5"
            />
          </Link>
          <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-xs font-semibold text-white/80 ring-1 ring-white/15 backdrop-blur-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-white">
              <Dumbbell size={16} strokeWidth={2.25} />
            </span>
            {GENERAL_LABELS.athleteHomeBrandChip}
          </div>
        </div>
      </div>
    </header>
  );
}

function ModalityIcon({
  modality,
  className,
}: {
  modality: ClassListItem['modality'];
  className?: string;
}) {
  return modality === 'online' ? (
    <Video size={14} className={className ?? 'shrink-0'} />
  ) : (
    <MapPin size={14} className={className ?? 'shrink-0'} />
  );
}

function sectionIconComponent(icon: SectionIcon) {
  if (icon === 'nearby') return MapPin;
  if (icon === 'recurring') return CalendarClock;
  if (icon === 'general') return Dumbbell;
  return Sparkles;
}

function SectionHead({
  title,
  icon,
  subtitle,
  count,
  variant = 'default',
}: {
  title: string;
  icon: SectionIcon;
  subtitle?: string;
  count?: number;
  variant?: SectionVariant;
}) {
  const Icon = sectionIconComponent(icon);

  return (
    <div
      className={[
        'fn-athlete-home-section-head flex min-w-0 items-start gap-3.5 md:gap-4',
        variant === 'feed' ? 'pb-0' : 'mb-5',
      ].join(' ')}
    >
      <span
        className={[
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl md:h-12 md:w-12',
          variant === 'feed'
            ? 'bg-[var(--fn-primary)] text-white shadow-sm'
            : 'bg-gradient-to-br from-[var(--fn-primary-muted)] to-[color-mix(in_srgb,var(--fn-primary)_18%,transparent)] text-[var(--fn-primary)] ring-1 ring-[color-mix(in_srgb,var(--fn-primary)_22%,var(--fn-border))]',
        ].join(' ')}
      >
        <Icon size={variant === 'feed' ? 20 : 19} strokeWidth={2.25} />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 className="m-0 text-lg font-extrabold tracking-tight text-[var(--fn-text)] md:text-xl lg:text-2xl">
            {title}
          </h2>
          {typeof count === 'number' && count > 0 ? (
            <span className="inline-flex items-center rounded-full bg-[var(--fn-primary-muted)] px-2.5 py-0.5 text-[0.6875rem] font-bold tabular-nums text-[var(--fn-primary-text)] ring-1 ring-[color-mix(in_srgb,var(--fn-primary)_18%,transparent)]">
              {GENERAL_LABELS.athleteHomeClassCount(count)}
            </span>
          ) : null}
        </div>
        {subtitle ? (
          <p className="mt-1.5 m-0 text-sm leading-relaxed text-[var(--fn-text-muted)]">{subtitle}</p>
        ) : (
          <span
            className="mt-2.5 block h-0.5 w-14 rounded-full bg-[var(--fn-primary)] opacity-80"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}

export function AthleteHomeRailCard({
  item,
  index,
  accent = 'recurring',
}: {
  item: ClassListItem;
  index: number;
  accent?: 'recurring' | 'recommended' | 'default';
}) {
  const full = item.spotsLeft === 0;
  const verified = hostIsVerified(item);
  const indexLabel = String(index + 1).padStart(2, '0');
  const headerGradient =
    accent === 'recommended'
      ? 'from-[var(--fn-primary)] via-[#1967d2] to-[#174ea6]'
      : 'from-[#0ea5e9] via-[#2563eb] to-[#1e3a8a]';
  const HeaderIcon = accent === 'recommended' ? Sparkles : CalendarClock;

  return (
    <Link
      href={`/class/${item.id}`}
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
      className="group relative flex w-[min(17.5rem,78vw)] shrink-0 snap-start flex-col overflow-hidden rounded-[1.35rem] border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-300 animate-[fn-home-fade-up_0.45s_ease-out_both] hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--fn-primary)_35%,var(--fn-border))] hover:shadow-[0_16px_36px_-20px_color-mix(in_srgb,var(--fn-primary)_45%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fn-primary)] sm:w-[18.5rem]"
    >
      <div
        className={`relative overflow-hidden border-b border-[var(--fn-border)] bg-gradient-to-br ${headerGradient} px-4 pb-4 pt-3.5 text-white`}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              'radial-gradient(circle at 90% 10%, rgba(255,255,255,0.35), transparent 40%), radial-gradient(circle at 0% 100%, rgba(45,212,191,0.3), transparent 45%)',
          }}
          aria-hidden="true"
        />
        <div className="relative z-[1] flex items-start justify-between gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
            <HeaderIcon size={18} strokeWidth={2.25} />
          </span>
          <span className="rounded-full bg-white/10 px-2 py-1 text-[0.625rem] font-bold tracking-[0.14em] text-white/80 ring-1 ring-white/15">
            {indexLabel}
          </span>
        </div>
        <p className="relative z-[1] mt-3 m-0 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-white/70">
          {item.discipline}
        </p>
        <p className="relative z-[1] mt-1 m-0 line-clamp-2 text-base font-extrabold leading-snug text-white">
          {item.title}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4 pb-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <RegularClassBadge item={item} size="sm" />
          {full ? <Badge label={BADGE_LABELS.full} variant="warning" size="sm" /> : null}
          {verified ? <Badge label={BADGE_LABELS.verified} variant="success" size="sm" /> : null}
        </div>

        <p className="m-0 text-[0.8125rem] leading-snug text-[var(--fn-text-muted)]">
          {formatClassDate(item.startAt)}
        </p>
        <p className="m-0 truncate text-[0.8125rem] font-semibold text-[var(--fn-text-secondary)]">
          {classHostLabel(item)}
        </p>

        <div className="mt-auto space-y-3 border-t border-[var(--fn-border)] pt-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--fn-text-muted)]">
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--fn-surface-muted)] px-2 py-1 font-medium">
              <Clock size={12} strokeWidth={2.5} />
              {item.durationMinutes} min
            </span>
            <span className="inline-flex min-w-0 max-w-full items-center gap-1 truncate rounded-full bg-[var(--fn-surface-muted)] px-2 py-1 font-medium">
              <ModalityIcon modality={item.modality} />
              <span className="truncate">
                {modalityLocationLabel(item.modality, item.location?.label)}
              </span>
            </span>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              {item.spotsLeft != null && !full ? (
                <p className="m-0 mb-1 inline-flex items-center gap-1 text-[0.6875rem] font-bold text-[var(--fn-primary-text)]">
                  <Users size={12} strokeWidth={2.5} />
                  {CLASS_CARD_LABELS.spotsLeft(item.spotsLeft)}
                </p>
              ) : null}
              <p className="m-0 text-xl font-black tracking-tight text-[var(--fn-primary)]">
                {formatMoney(item.price)}
              </p>
            </div>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--fn-primary-muted)] px-3 py-1.5 text-[0.6875rem] font-bold text-[var(--fn-primary-text)] transition group-hover:bg-[var(--fn-primary)] group-hover:text-white">
              {BUTTON_LABELS.bookNow}
              <ArrowUpRight size={13} strokeWidth={2.5} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function AthleteHomeFeatureCard({
  item,
  index,
  flip: _flip,
}: {
  item: ClassListItem;
  index: number;
  /** @deprecated Alternating layout removed; prop kept for call-site compatibility. */
  flip?: boolean;
}) {
  void _flip;
  const full = item.spotsLeft === 0;
  const verified = hostIsVerified(item);
  const indexLabel = String(index + 1).padStart(2, '0');

  return (
    <Link
      href={`/class/${item.id}`}
      style={{ animationDelay: `${Math.min(index, 9) * 40}ms` }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-300 animate-[fn-home-fade-up_0.45s_ease-out_both] hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--fn-primary)_35%,var(--fn-border))] hover:shadow-[0_16px_36px_-20px_color-mix(in_srgb,var(--fn-primary)_45%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fn-primary)]"
    >
      <div className="relative overflow-hidden border-b border-[var(--fn-border)] bg-gradient-to-br from-[var(--fn-primary)] via-[#1d4ed8] to-[#0f172a] px-5 pb-5 pt-4 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 85% 15%, rgba(255,255,255,0.35), transparent 42%), radial-gradient(circle at 10% 90%, rgba(56,189,248,0.35), transparent 45%)',
          }}
          aria-hidden="true"
        />
        <div className="relative z-[1] flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
              {item.modality === 'online' ? (
                <Video size={22} strokeWidth={2.25} />
              ) : (
                <Dumbbell size={22} strokeWidth={2.25} />
              )}
            </span>
            <div className="min-w-0">
              <p className="m-0 text-[0.625rem] font-bold uppercase tracking-[0.18em] text-white/70">
                {item.discipline}
              </p>
              <p className="mt-1 m-0 text-xs font-semibold text-white/85">
                {formatClassDate(item.startAt)}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[0.625rem] font-bold tracking-[0.14em] text-white/75 ring-1 ring-white/15">
            {indexLabel}
          </span>
        </div>
        <div className="relative z-[1] mt-4 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/12 px-2.5 py-1 text-[0.6875rem] font-semibold text-white/90 ring-1 ring-white/15">
            <Clock size={12} strokeWidth={2.5} />
            {item.durationMinutes} min
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/12 px-2.5 py-1 text-[0.6875rem] font-semibold text-white/90 ring-1 ring-white/15">
            <ModalityIcon modality={item.modality} className="shrink-0 text-white/90" />
            {modalityLocationLabel(item.modality, item.location?.label)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="m-0 text-lg font-extrabold leading-snug tracking-tight text-[var(--fn-text)] transition group-hover:text-[var(--fn-primary-text)] md:text-xl">
            {item.title}
          </h3>
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--fn-border)] bg-[var(--fn-surface-muted)] text-[var(--fn-text-muted)] transition group-hover:border-[var(--fn-primary)]/30 group-hover:bg-[var(--fn-primary-muted)] group-hover:text-[var(--fn-primary)]">
            <ArrowUpRight size={16} strokeWidth={2.25} />
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <p className="m-0 text-sm font-semibold text-[var(--fn-text-secondary)]">
            {classHostLabel(item)}
          </p>
          {verified ? <Badge label={BADGE_LABELS.verified} variant="success" size="sm" /> : null}
          <RegularClassBadge item={item} size="sm" />
          {full ? <Badge label={BADGE_LABELS.full} variant="warning" size="sm" /> : null}
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-[var(--fn-border)] pt-4">
          <div className="min-w-0 space-y-1.5">
            {item.spotsLeft != null && !full ? (
              <p className="m-0 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--fn-primary-text)]">
                <Users size={13} strokeWidth={2.5} />
                {CLASS_CARD_LABELS.spotsLeft(item.spotsLeft)}
              </p>
            ) : full ? (
              <p className="m-0 text-xs font-bold text-[var(--fn-text-muted)]">{BADGE_LABELS.full}</p>
            ) : null}
            <p className="m-0 text-[1.5rem] font-black tracking-tight text-[var(--fn-primary)]">
              {formatMoney(item.price)}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--fn-primary-muted)] px-3.5 py-2 text-xs font-bold text-[var(--fn-primary-text)] transition group-hover:bg-[var(--fn-primary)] group-hover:text-white">
            {BUTTON_LABELS.bookNow}
            <ArrowUpRight size={14} strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function SectionEmpty({
  message,
  icon = 'dumbbell',
}: {
  message: string;
  icon?: 'dumbbell' | 'sparkles' | 'map';
}) {
  const Icon = icon === 'sparkles' ? Sparkles : icon === 'map' ? MapPin : Dumbbell;

  return (
    <div className="flex flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-[color-mix(in_srgb,var(--fn-primary)_18%,var(--fn-border))] bg-[color-mix(in_srgb,var(--fn-surface-muted)_50%,var(--fn-surface))] px-6 py-12 text-center md:py-14">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--fn-primary-muted)] text-[var(--fn-primary)] ring-1 ring-[color-mix(in_srgb,var(--fn-primary)_15%,transparent)]">
        <Icon size={22} strokeWidth={2.25} />
      </span>
      <p className="m-0 max-w-sm text-sm leading-relaxed text-[var(--fn-text-muted)]">{message}</p>
      <Link
        href="/athlete/search"
        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--fn-primary-muted)] px-4 py-2 text-sm font-bold text-[var(--fn-primary-text)] transition hover:bg-[var(--fn-primary)] hover:text-white"
      >
        {GENERAL_LABELS.search}
        <ArrowRight size={14} strokeWidth={2.5} />
      </Link>
    </div>
  );
}

export function AthleteHomeSectionRail({
  title,
  icon,
  subtitle,
  emptyMessage,
  emptyIcon,
  count,
  variant = 'default',
  children,
}: {
  title: string;
  icon: SectionIcon;
  subtitle?: string;
  emptyMessage?: string;
  emptyIcon?: 'dumbbell' | 'sparkles' | 'map';
  count?: number;
  variant?: SectionVariant;
  children: React.ReactNode;
}) {
  const hasItems = Array.isArray(children)
    ? children.length > 0
    : Boolean(children);

  const resolvedSubtitle =
    subtitle ??
    (icon === 'recurring' ? GENERAL_LABELS.regularClassesSubtitle : undefined);

  const itemCount = count ?? (Array.isArray(children) ? children.length : 0);

  return (
    <section className={variant === 'feed' ? 'fn-athlete-home-section-feed' : ''}>
      <SectionHead
        title={title}
        icon={icon}
        subtitle={resolvedSubtitle}
        count={hasItems ? itemCount : undefined}
        variant={variant}
      />
      {hasItems ? (
        <div className="relative -mx-1 sm:mx-0">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-5 bg-gradient-to-r from-[var(--fn-bg)] to-transparent sm:w-6"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-6 bg-gradient-to-l from-[var(--fn-bg)] to-transparent sm:w-10"
            aria-hidden="true"
          />
          <div className="flex gap-3 overflow-x-auto px-1 pb-2 pt-0.5 [scrollbar-color:var(--fn-primary-muted)_transparent] [scrollbar-width:thin] snap-x snap-mandatory sm:gap-4 md:pb-3">
            {children}
          </div>
        </div>
      ) : (
        <SectionEmpty
          message={emptyMessage ?? GENERAL_LABELS.regularClassesEmpty}
          icon={emptyIcon ?? (icon === 'recommended' ? 'sparkles' : 'dumbbell')}
        />
      )}
    </section>
  );
}

export function AthleteHomeSectionStack({
  title,
  icon = 'recommended',
  subtitle,
  emptyMessage,
  emptyIcon,
  count,
  variant = 'default',
  children,
}: {
  title: string;
  icon?: SectionIcon;
  subtitle?: string;
  emptyMessage?: string;
  emptyIcon?: 'dumbbell' | 'sparkles' | 'map';
  count?: number;
  variant?: SectionVariant;
  children: React.ReactNode;
}) {
  const hasItems = Array.isArray(children)
    ? children.length > 0
    : Boolean(children);

  const resolvedSubtitle =
    subtitle ??
    (icon === 'general' ? GENERAL_LABELS.generalClassesSubtitle : undefined);

  const itemCount = count ?? (Array.isArray(children) ? children.length : 0);

  return (
    <section className={variant === 'feed' ? 'fn-athlete-home-section-feed' : ''}>
      <SectionHead
        title={title}
        icon={icon}
        subtitle={resolvedSubtitle}
        count={hasItems ? itemCount : undefined}
        variant={variant}
      />
      {hasItems ? (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 xl:gap-5">{children}</div>
      ) : (
        <SectionEmpty
          message={emptyMessage ?? GENERAL_LABELS.generalClassesEmpty}
          icon={emptyIcon ?? (icon === 'nearby' ? 'map' : 'dumbbell')}
        />
      )}
    </section>
  );
}
