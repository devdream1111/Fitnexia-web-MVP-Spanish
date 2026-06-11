'use client';

import Link from 'next/link';
import { Dumbbell, MapPin, Sparkles, Video } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { BADGE_LABELS, CLASS_CARD_LABELS, modalityLocationLabel } from '@/constants/labels';
import { formatClassDate, formatMoney } from '@/data/mock';
import type { ClassListItem } from '@/types/api';

export function AthleteHomeShell({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-10 pb-2">{children}</div>;
}

export function AthleteHomeHero({ eyebrow, title }: { eyebrow: string; title: string }) {
  const titleWords = title.split(' ');
  const lead = titleWords.slice(0, -2).join(' ');
  const punch = titleWords.slice(-2).join(' ');

  return (
    <header className="relative -mx-1 overflow-hidden rounded-r-[2rem] border border-[var(--fn-border)] border-l-[6px] border-l-[var(--fn-primary)] bg-[var(--fn-surface)] p-8 shadow-[12px_12px_0_var(--fn-primary-muted)] md:mx-0 md:p-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            'linear-gradient(var(--fn-border) 1px, transparent 1px), linear-gradient(90deg, var(--fn-border) 1px, transparent 1px)',
          backgroundSize: '2.5rem 2.5rem',
          maskImage: 'linear-gradient(135deg, black 20%, transparent 70%)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full border border-[var(--fn-border)] bg-[var(--fn-primary-muted)] opacity-55"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-[-1.5rem] right-12 h-[4.5rem] w-[4.5rem] rounded-full border border-[var(--fn-border)] bg-[var(--fn-surface-muted)]"
        aria-hidden="true"
      />

      <div className="relative z-10">
        <p className="m-0 text-[0.6875rem] font-extrabold uppercase tracking-[0.2em] text-[var(--fn-primary-text)]">
          {eyebrow}
        </p>
        <h1 className="mt-3 leading-[0.95]">
          {lead ? (
            <>
              <span className="block text-[clamp(2rem,5vw,3.25rem)] font-medium tracking-tight text-[var(--fn-text-secondary)]">
                {lead}
              </span>
              <span className="mt-[0.15em] block text-[clamp(2.5rem,7vw,4.5rem)] font-black tracking-tight text-[var(--fn-text)]">
                {punch}
              </span>
            </>
          ) : (
            <span className="block text-[clamp(2.5rem,7vw,4.5rem)] font-black tracking-tight text-[var(--fn-text)]">
              {title}
            </span>
          )}
        </h1>
      </div>

      <div
        className="absolute bottom-5 right-5 flex h-14 w-14 rotate-[-8deg] items-center justify-center rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]"
        aria-hidden="true"
      >
        <Dumbbell size={28} strokeWidth={2.25} />
      </div>
    </header>
  );
}

function ModalityIcon({ modality }: { modality: ClassListItem['modality'] }) {
  return modality === 'online' ? <Video size={14} className="shrink-0" /> : <MapPin size={14} className="shrink-0" />;
}

function SectionHead({ title, icon }: { title: string; icon: 'nearby' | 'recommended' }) {
  const Icon = icon === 'nearby' ? MapPin : Sparkles;

  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.625rem] bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]">
        <Icon size={18} strokeWidth={2.25} />
      </span>
      <h2 className="m-0 shrink-0 text-lg font-extrabold tracking-tight text-[var(--fn-text)]">{title}</h2>
      <span
        className="h-0.5 flex-1 opacity-45"
        style={{ background: 'linear-gradient(90deg, var(--fn-primary), transparent)' }}
        aria-hidden="true"
      />
    </div>
  );
}

export function AthleteHomeRailCard({ item, index }: { item: ClassListItem; index: number }) {
  const full = item.spotsLeft === 0;

  return (
    <Link
      href={`/class/${item.id}`}
      className="group relative flex w-[min(17rem,78vw)] shrink-0 snap-start flex-col overflow-hidden rounded-[1.25rem] border border-[var(--fn-border)] bg-[var(--fn-surface)] transition hover:-translate-y-1 hover:border-[var(--fn-primary)] hover:shadow-[8px_8px_0_var(--fn-primary-muted)]"
    >
      <span className="absolute right-3 top-3 z-[2] text-[0.625rem] font-extrabold tracking-[0.12em] text-[var(--fn-text-muted)]">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="flex h-[6.5rem] items-center justify-center border-b border-[var(--fn-border)] bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]">
        <Dumbbell size={28} strokeWidth={2} />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4 pb-[1.125rem]">
        <div className="flex items-start justify-between gap-2">
          <h3 className="m-0 text-base font-extrabold leading-tight text-[var(--fn-text)]">{item.title}</h3>
          {full ? <Badge label={BADGE_LABELS.full} variant="warning" /> : null}
        </div>
        <p className="m-0 text-[0.8125rem] leading-snug text-[var(--fn-text-muted)]">
          {item.discipline} · {formatClassDate(item.startAt)}
        </p>
        <p className="m-0 text-[0.8125rem] font-semibold leading-snug text-[var(--fn-text-secondary)]">
          {item.instructor.displayName}
        </p>
        <div className="mt-auto flex flex-col gap-2 border-t border-dashed border-[var(--fn-border)] pt-3">
          <span className="flex items-center gap-1.5 text-xs text-[var(--fn-text-muted)]">
            <ModalityIcon modality={item.modality} />
            <span className="truncate">{modalityLocationLabel(item.modality, item.location?.label)}</span>
          </span>
          <div className="flex items-baseline justify-between gap-2">
            {item.spotsLeft != null && !full ? (
              <span className="text-[0.6875rem] font-bold text-[var(--fn-primary-text)]">
                {CLASS_CARD_LABELS.spotsLeft(item.spotsLeft)}
              </span>
            ) : (
              <span />
            )}
            <span className="text-xl font-black text-[var(--fn-primary)]">{formatMoney(item.price)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function AthleteHomeFeatureCard({
  item,
  index,
  flip,
}: {
  item: ClassListItem;
  index: number;
  flip?: boolean;
}) {
  const full = item.spotsLeft === 0;
  const indexLabel = String(index + 1).padStart(2, '0');

  return (
    <Link
      href={`/class/${item.id}`}
      className={`group relative grid overflow-hidden rounded-[1.25rem] border border-[var(--fn-border)] bg-[var(--fn-surface)] transition hover:translate-x-1 hover:shadow-[-6px_6px_0_var(--fn-primary-muted)] ${
        flip ? 'grid-cols-[1fr_auto] md:grid-cols-[1fr_5.5rem]' : 'grid-cols-[auto_1fr] md:grid-cols-[5.5rem_1fr]'
      }`}
    >
      <span
        className={`pointer-events-none absolute top-2.5 z-[2] text-4xl font-black leading-none tracking-tighter text-[var(--fn-primary-muted)] ${
          flip ? 'right-[4.5rem]' : 'left-[4.5rem]'
        }`}
      >
        {indexLabel}
      </span>

      <div
        className={`flex w-[5.5rem] items-center justify-center bg-[var(--fn-surface-muted)] text-[var(--fn-primary)] ${
          flip ? 'order-2 border-l border-[var(--fn-border)]' : 'border-r border-[var(--fn-border)]'
        }`}
      >
        <Dumbbell size={32} strokeWidth={2} />
      </div>

      <div className={`relative flex min-w-0 flex-col gap-1.5 p-5 md:p-6 ${flip ? 'order-1' : ''}`}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="m-0 pr-8 text-lg font-extrabold leading-tight text-[var(--fn-text)]">{item.title}</h3>
          {full ? <Badge label={BADGE_LABELS.full} variant="warning" /> : null}
        </div>
        <p className="m-0 text-[0.8125rem] text-[var(--fn-text-muted)]">
          {item.discipline} · {formatClassDate(item.startAt)}
        </p>
        <p className="m-0 text-[0.8125rem] font-semibold text-[var(--fn-text-secondary)]">
          {item.instructor.displayName}
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--fn-border)] pt-3">
          <span className="flex items-center gap-1.5 text-xs text-[var(--fn-text-muted)]">
            <ModalityIcon modality={item.modality} />
            <span className="truncate">{modalityLocationLabel(item.modality, item.location?.label)}</span>
          </span>
          <div className="ml-auto flex items-baseline gap-3">
            {item.spotsLeft != null && !full ? (
              <span className="text-[0.6875rem] font-bold text-[var(--fn-primary-text)]">
                {CLASS_CARD_LABELS.spotsLeft(item.spotsLeft)}
              </span>
            ) : null}
            <span className="text-[1.375rem] font-black text-[var(--fn-primary)]">{formatMoney(item.price)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function AthleteHomeSectionRail({
  title,
  icon,
  children,
}: {
  title: string;
  icon: 'nearby' | 'recommended';
  children: React.ReactNode;
}) {
  return (
    <section>
      <SectionHead title={title} icon={icon} />
      <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 pt-2 [scrollbar-color:var(--fn-primary-muted)_transparent] [scrollbar-width:thin] snap-x snap-mandatory">
        {children}
      </div>
    </section>
  );
}

export function AthleteHomeSectionStack({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <SectionHead title={title} icon="recommended" />
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}
