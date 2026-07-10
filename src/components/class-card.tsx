'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Clock,
  Dumbbell,
  Edit3,
  MapPin,
  Star,
  Users,
  Video,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  BADGE_LABELS,
  BUTTON_LABELS,
  CLASS_CARD_LABELS,
  classFormatBadgeLabel,
  modalityLocationLabel,
} from '@/constants/labels';
import { formatClassDate, formatMoney } from '@/utils/format';
import { classHostLabel } from '@/utils/class-instructor';
import { levelLabel, languageLabel } from '@/utils/advanced-search';
import { hostIsVerified } from '@/utils/verification';
import { RegularClassBadge } from '@/components/regular-class-badge';
import type { ClassListItem, Modality } from '@/types/api';

function ModalityIcon({ modality }: { modality: Modality }) {
  if (modality === 'online') return <Video size={12} strokeWidth={2.5} className="shrink-0" />;
  return <MapPin size={12} strokeWidth={2.5} className="shrink-0" />;
}

function ClassCardInner({
  item,
  compact,
  showEdit,
  editHref,
}: {
  item: ClassListItem;
  compact?: boolean;
  showEdit?: boolean;
  editHref?: string;
}) {
  const full = item.spotsLeft === 0;
  const verified = hostIsVerified(item);
  const metaBits = [
    item.level ? levelLabel(item.level) : null,
    item.language ? languageLabel(item.language) : null,
    classFormatBadgeLabel(item.classFormat),
  ].filter(Boolean);

  const cardClass = [
    'fn-class-card group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)]',
    'shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-300',
    'hover:-translate-y-1.5 hover:border-[color-mix(in_srgb,var(--fn-primary)_35%,var(--fn-border))]',
    'hover:shadow-[0_18px_40px_-20px_color-mix(in_srgb,var(--fn-primary)_45%,transparent)]',
    compact ? 'mb-2' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClass}>
      {showEdit && editHref ? (
        <Link
          href={editHref}
          className="absolute right-3 top-3 z-20 inline-flex items-center gap-1 rounded-xl bg-white/15 px-2.5 py-1.5 text-xs font-bold text-white ring-1 ring-white/25 backdrop-blur-sm transition hover:bg-white/25"
          onClick={(e) => e.stopPropagation()}
        >
          <Edit3 size={14} />
          {BUTTON_LABELS.edit}
        </Link>
      ) : null}

      <Link href={`/class/${item.id}`} className="flex h-full flex-col outline-none">
        <div className="fn-class-card-media relative overflow-hidden border-b border-[var(--fn-border)] px-4 pb-4 pt-3.5 text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(circle at 92% 8%, rgba(255,255,255,0.35), transparent 42%), radial-gradient(circle at 8% 95%, rgba(45,212,191,0.28), transparent 48%)',
            }}
            aria-hidden="true"
          />
          <div className="relative z-[1] flex items-start justify-between gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
              {item.modality === 'online' ? (
                <Video size={18} strokeWidth={2.25} />
              ) : (
                <Dumbbell size={18} strokeWidth={2.25} />
              )}
            </span>
            <div className={`flex flex-wrap items-center justify-end gap-1.5 ${showEdit ? 'pr-16' : ''}`}>
              <RegularClassBadge item={item} size="sm" />
              {full ? <Badge label={BADGE_LABELS.full} variant="warning" size="sm" /> : null}
            </div>
          </div>
          <p className="relative z-[1] mt-3 m-0 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-white/70">
            {item.discipline}
          </p>
          <h3 className="relative z-[1] mt-1 m-0 line-clamp-2 text-lg font-extrabold leading-snug tracking-tight text-white md:text-xl">
            {item.title}
          </h3>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4 pb-5 md:p-5">
          <p className="m-0 text-sm font-semibold text-[var(--fn-text)]">{formatClassDate(item.startAt)}</p>

          {metaBits.length > 0 ? (
            <p className="m-0 truncate text-xs text-[var(--fn-text-muted)]">{metaBits.join(' · ')}</p>
          ) : null}

          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <p className="m-0 truncate text-sm font-semibold text-[var(--fn-text-secondary)]">
              {classHostLabel(item)}
            </p>
            {verified ? <Badge label={BADGE_LABELS.verified} variant="success" size="sm" /> : null}
            {item.averageRating != null && item.averageRating > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[0.6875rem] font-bold text-amber-700 dark:text-amber-300">
                <Star size={11} strokeWidth={2.5} className="fill-current" />
                {item.averageRating.toFixed(1)}
              </span>
            ) : null}
          </div>

          <div className="mt-auto space-y-3 border-t border-[var(--fn-border)] pt-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--fn-text-muted)]">
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--fn-surface-muted)] px-2.5 py-1 font-semibold">
                <Clock size={12} strokeWidth={2.5} />
                {item.durationMinutes} min
              </span>
              <span className="inline-flex min-w-0 max-w-full items-center gap-1 truncate rounded-full bg-[var(--fn-surface-muted)] px-2.5 py-1 font-semibold">
                <ModalityIcon modality={item.modality} />
                <span className="truncate">
                  {modalityLocationLabel(item.modality, item.location?.label)}
                </span>
              </span>
            </div>

            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                {item.spotsLeft != null && !full ? (
                  <p className="m-0 mb-1 inline-flex items-center gap-1 text-[0.6875rem] font-bold text-[var(--fn-primary-text)]">
                    <Users size={12} strokeWidth={2.5} />
                    {CLASS_CARD_LABELS.spotsLeft(item.spotsLeft)}
                  </p>
                ) : null}
                <p className="m-0 text-xl font-black tracking-tight text-[var(--fn-primary)] md:text-2xl">
                  {formatMoney(item.price)}
                </p>
              </div>
              {!showEdit ? (
                <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-[var(--fn-primary-muted)] px-3 py-1.5 text-[0.6875rem] font-bold text-[var(--fn-primary-text)] transition group-hover:bg-[var(--fn-primary)] group-hover:text-white">
                  {BUTTON_LABELS.bookNow}
                  <ArrowUpRight size={13} strokeWidth={2.5} />
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export const ClassCard = React.memo(ClassCardInner);
