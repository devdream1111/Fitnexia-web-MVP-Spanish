'use client';

import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { BADGE_LABELS, CLASS_CARD_LABELS, modalityLocationLabel } from '@/constants/labels';
import { formatClassDate, formatMoney } from '@/data/mock';
import type { ClassListItem } from '@/types/api';

export function ClassCard({ item, compact }: { item: ClassListItem; compact?: boolean }) {
  const full = item.spotsLeft === 0;
  return (
    <Link
      href={`/class/${item.id}`}
      className={`flex gap-4 rounded-2xl bg-[var(--fn-surface)] p-4 shadow-sm transition hover:shadow-md ${compact ? 'mb-2' : 'mb-4'}`}>
      <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-xl bg-[var(--fn-primary-muted)] text-2xl">
        🏋️
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-bold text-[var(--fn-text)]">{item.title}</h3>
          {full ? <Badge label={BADGE_LABELS.full} variant="warning" /> : null}
        </div>
        <p className="text-sm text-[var(--fn-text-muted)]">
          {item.discipline} · {formatClassDate(item.startAt)}
        </p>
        <div className="mt-1 flex justify-between text-sm">
          <span className="text-[var(--fn-text-secondary)]">{item.instructor.displayName}</span>
          <span className="font-semibold text-[var(--fn-primary)]">{formatMoney(item.price)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-[var(--fn-text-muted)]">
          <span>
            {item.modality === 'online' ? '📹' : '📍'}{' '}
            {modalityLocationLabel(item.modality, item.location?.label)}
          </span>
          {item.spotsLeft != null && !full ? (
            <span className="text-[var(--fn-primary)]">
              {CLASS_CARD_LABELS.spotsLeft(item.spotsLeft)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
