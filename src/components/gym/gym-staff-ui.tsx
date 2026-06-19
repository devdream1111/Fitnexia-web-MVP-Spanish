'use client';

import Link from 'next/link';
import { Star, UserRound } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BADGE_LABELS, BUTTON_LABELS, DISCIPLINE_LABELS, GYM_LABELS } from '@/constants/labels';
import type { StaffRosterItem } from '@/services/api';

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function GymStaffHero({
  linked,
  pending,
}: {
  linked: number;
  pending: number;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-[#2563eb] to-slate-900 px-6 py-8 md:px-10 md:py-10">
      <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
        <div className="absolute -right-12 -top-12 h-52 w-52 rounded-full bg-fuchsia-400/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-cyan-400/30 blur-2xl" />
      </div>
      <div className="relative space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Staff · Fitnexia</p>
        <h1 className="max-w-2xl text-3xl font-black leading-tight text-white md:text-4xl">
          {GYM_LABELS.instructors.rosterTitle}
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-white/80 md:text-base">
          {GYM_LABELS.instructors.rosterSubtitle}
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <span className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
            {GYM_LABELS.instructors.linkedCount(linked)}
          </span>
          {pending > 0 ? (
            <span className="rounded-full border border-amber-300/40 bg-amber-400/20 px-4 py-1.5 text-sm font-semibold text-amber-100">
              {GYM_LABELS.instructors.pendingCount(pending)}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function GymStaffCard({
  item,
  busy,
  onAdd,
  onUnlink,
  onCancelInvite,
}: {
  item: StaffRosterItem;
  busy?: boolean;
  onAdd: (id: string) => void;
  onUnlink?: (id: string) => void;
  onCancelInvite?: (inviteId: string) => void;
}) {
  const disciplineLabels = item.disciplines
    .map((d) => DISCIPLINE_LABELS[d as keyof typeof DISCIPLINE_LABELS] ?? d)
    .join(' · ');

  const statusAccent =
    item.staffStatus === 'linked'
      ? 'from-emerald-500/20 via-transparent to-transparent'
      : item.staffStatus === 'pending'
        ? 'from-amber-500/25 via-transparent to-transparent'
        : 'from-[var(--fn-primary)]/15 via-transparent to-transparent';

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] transition hover:-translate-y-1 hover:border-[var(--fn-primary)]/40 hover:shadow-xl">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${statusAccent} opacity-100`}
        aria-hidden="true"
      />
      <div className="relative flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
          <div className="flex min-w-0 items-start gap-4">
          <Link
            href={`/gym/instructors/${item.id}`}
            className="flex min-w-0 flex-1 items-start gap-4 transition hover:opacity-90"
          >
            <div className="relative shrink-0">
              {item.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.photoUrl}
                  alt=""
                  className="h-16 w-16 rounded-2xl object-cover ring-2 ring-[var(--fn-primary)]/20"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--fn-primary-muted)] to-violet-500/20 text-lg font-black text-[var(--fn-primary)]">
                  {initials(item.displayName) || <UserRound size={24} />}
                </div>
              )}
              {item.verified ? (
                <span className="absolute -bottom-1 -right-1">
                  <Badge label={BADGE_LABELS.verified} variant="success" size="sm" />
                </span>
              ) : null}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-extrabold text-[var(--fn-text)]">{item.displayName}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-[var(--fn-text-muted)]">
                {disciplineLabels || '—'}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--fn-text-secondary)]">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  {item.averageRating.toFixed(1)}
                </span>
                <span className="text-xs text-[var(--fn-text-muted)]">({item.reviewCount})</span>
                {item.staffStatus === 'linked' ? (
                  <Badge label={GYM_LABELS.instructors.onStaff} variant="success" size="sm" />
                ) : null}
                {item.staffStatus === 'pending' ? (
                  <Badge label={GYM_LABELS.instructors.pending} variant="warning" size="sm" />
                ) : null}
                {item.staffReview ? (
                  <Badge label={GYM_LABELS.instructors.reviewSent} variant="default" size="sm" />
                ) : null}
              </div>
            </div>
          </Link>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">
          {item.staffStatus === 'none' ? (
            <Button
              title={GYM_LABELS.instructors.addToStaff}
              size="sm"
              loading={busy}
              onClick={() => onAdd(item.id)}
            />
          ) : null}
          {item.staffStatus === 'pending' ? (
            <>
              <Button title={GYM_LABELS.instructors.pending} size="sm" variant="outline" disabled />
              {item.inviteId && onCancelInvite ? (
                <Button
                  title={BUTTON_LABELS.cancelInvite}
                  size="sm"
                  variant="ghost"
                  loading={busy}
                  className="text-[var(--fn-error)]"
                  onClick={() => onCancelInvite(item.inviteId!)}
                />
              ) : null}
            </>
          ) : null}
          {item.staffStatus === 'linked' && onUnlink ? (
            <Button
              title={BUTTON_LABELS.removeFromStaff}
              size="sm"
              variant="outline"
              loading={busy}
              className="border-red-500/30 text-red-600 hover:bg-red-500/10"
              onClick={() => onUnlink(item.id)}
            />
          ) : null}
          {item.canLeaveStaffReview ? (
            <Link href={`/gym/review-instructor/${item.id}`}>
              <Button title={GYM_LABELS.instructors.review} size="sm" variant="secondary" />
            </Link>
          ) : null}
          {item.staffStatus === 'linked' && !item.canLeaveStaffReview && !item.staffReview ? (
            <Button
              title={GYM_LABELS.instructors.review}
              size="sm"
              variant="ghost"
              disabled
              className="opacity-50"
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function GymStaffGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 lg:grid-cols-2">{children}</div>;
}
