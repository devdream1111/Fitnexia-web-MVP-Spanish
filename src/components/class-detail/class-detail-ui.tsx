'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Clock,
  DollarSign,
  MapPin,
  Star,
  UserRound,
  Users,
  Video,
  X,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BADGE_LABELS } from '@/constants/labels';
import type { Review } from '@/types/api';

export function ClassDetailHeader({
  title,
  onClose,
  compact,
}: {
  title: string;
  onClose?: () => void;
  compact?: boolean;
}) {
  const router = useRouter();
  const handleClose = onClose ?? (() => router.back());

  return (
    <header
      className={`sticky top-0 z-30 border-b border-[var(--fn-border)] bg-[var(--fn-surface)]/95 backdrop-blur-md ${
        compact ? 'px-4 py-3' : '-mx-4 px-4 py-3 sm:-mx-6 sm:px-6'
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface-muted)] text-[var(--fn-text-muted)] transition hover:border-[var(--fn-primary)] hover:text-[var(--fn-text)]"
          aria-label="Cerrar"
        >
          {compact ? <X size={20} /> : <ArrowLeft size={20} />}
        </button>
        <h1 id="class-detail-title" className="min-w-0 flex-1 truncate text-lg font-bold text-[var(--fn-text)]">
          {title}
        </h1>
      </div>
    </header>
  );
}

export function ClassDetailTitleBlock({
  title,
  badges,
}: {
  title: string;
  badges: ReactNode;
}) {
  return (
    <div className="space-y-3 border-b border-[var(--fn-border)] pb-6">
      <h2 className="text-2xl font-extrabold leading-tight text-[var(--fn-text)] sm:text-3xl">{title}</h2>
      <div className="flex flex-wrap gap-2">{badges}</div>
    </div>
  );
}

export function ClassDetailFact({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fn-text-muted)]">{label}</p>
        <p className="mt-1 text-sm font-semibold leading-snug text-[var(--fn-text)] sm:text-base">{value}</p>
      </div>
    </div>
  );
}

export function ClassDetailFactGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

export function ClassDetailInstructorCard({
  href,
  name,
  verified,
  rating,
  viewProfileLabel,
}: {
  href: string;
  name: string;
  verified?: boolean;
  rating?: number;
  viewProfileLabel: string;
}) {
  const initials = name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4 transition hover:border-[var(--fn-primary)]/40"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--fn-primary-muted)] text-sm font-bold text-[var(--fn-primary)]">
        {initials || <UserRound size={20} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-[var(--fn-text)]">{name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {verified ? <Badge label={BADGE_LABELS.verified} variant="success" size="sm" /> : null}
          {rating != null ? (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--fn-text-secondary)]">
              <Star size={14} className="fill-[var(--fn-warning)] text-[var(--fn-warning)]" />
              {rating.toFixed(1)}
            </span>
          ) : null}
        </div>
      </div>
      <span className="inline-flex shrink-0 items-center gap-0.5 text-sm font-semibold text-[var(--fn-primary)]">
        {viewProfileLabel}
        <ChevronRight size={16} />
      </span>
    </Link>
  );
}

export function ClassDetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-base font-bold text-[var(--fn-text)]">{title}</h3>
      {children}
    </section>
  );
}

export function ClassDetailReviews({
  title,
  reviews,
}: {
  title: string;
  reviews: Review[];
}) {
  if (reviews.length === 0) return null;

  return (
    <section className="space-y-4">
      <h3 className="text-base font-bold text-[var(--fn-text)]">{title}</h3>
      <ul className="space-y-3">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-[var(--fn-text)]">{review.authorName}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--fn-text-secondary)]" aria-label={`${review.rating} de 5`}>
                  {'★'.repeat(review.rating)}
                  <span className="text-[var(--fn-border)]">{'★'.repeat(5 - review.rating)}</span>
                </span>
                {review.verified ? <Badge label={BADGE_LABELS.verified} variant="success" size="sm" /> : null}
              </div>
            </div>
            {review.comment ? (
              <p className="mt-3 text-sm leading-relaxed text-[var(--fn-text-muted)]">{review.comment}</p>
            ) : null}
            <p className="mt-3 text-xs text-[var(--fn-text-muted)]">
              {new Date(review.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ClassDetailBookingPanel({
  price,
  spotsLabel,
  full,
  waitlistEnabled,
  bookLabel,
  waitlistLabel,
  fullLabel,
  onBook,
  onWaitlist,
}: {
  price: string;
  spotsLabel?: string;
  full: boolean;
  waitlistEnabled: boolean;
  bookLabel: string;
  waitlistLabel: string;
  fullLabel: string;
  onBook: () => void;
  onWaitlist: () => void;
}) {
  return (
    <aside className="rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5 lg:sticky lg:top-20">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fn-text-muted)]">Precio</p>
          <p className="mt-1 text-3xl font-extrabold text-[var(--fn-primary)]">{price}</p>
        </div>
        {spotsLabel ? (
          <div className="flex items-start gap-3 rounded-lg bg-[var(--fn-surface-muted)] px-3 py-2.5">
            <Users size={18} className="mt-0.5 shrink-0 text-[var(--fn-primary)]" />
            <p className="text-sm font-medium text-[var(--fn-text-secondary)]">{spotsLabel}</p>
          </div>
        ) : null}
        <div className="pt-1">
          {full ? (
            waitlistEnabled ? (
              <Button title={waitlistLabel} variant="secondary" className="w-full" onClick={onWaitlist} />
            ) : (
              <Button title={fullLabel} disabled className="w-full" />
            )
          ) : (
            <Button title={bookLabel} className="w-full" onClick={onBook} />
          )}
        </div>
      </div>
    </aside>
  );
}

export function ClassDetailModalityIcon({ online }: { online: boolean }) {
  return online ? Video : MapPin;
}

export { Calendar, Clock, DollarSign, MapPin, Users };
