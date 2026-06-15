'use client';

import React from 'react';
import Link from 'next/link';
import { Dumbbell, Video, MapPin, Edit3 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BADGE_LABELS, CLASS_CARD_LABELS, classFormatBadgeLabel, modalityLocationLabel, BUTTON_LABELS } from '@/constants/labels';
import { formatClassDate, formatMoney } from '@/utils/format';
import { classHostLabel } from '@/utils/class-instructor';
import type { ClassListItem } from '@/types/api';

function ClassCardInner({ item, compact, showEdit, editHref }: { 
  item: ClassListItem; 
  compact?: boolean;
  showEdit?: boolean;
  editHref?: string;
}) {
  const full = item.spotsLeft === 0;

  const content = (
    <div className="fn-class-card-inner flex flex-col gap-4 p-5 md:flex-row md:p-6">
      <div className="fn-class-card-thumb flex h-28 w-full shrink-0 items-center justify-center rounded-2xl md:w-28">
        <Dumbbell size={36} className="text-white drop-shadow-sm" />
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-lg font-bold text-[var(--fn-text)]">{item.title}</h3>
          <div className="flex items-center gap-2 shrink-0">
            {full ? <Badge label={BADGE_LABELS.full} variant="warning" /> : null}
            {showEdit && editHref ? (
              <Link href={editHref} onClick={(e) => e.stopPropagation()}>
                <Button variant="outline" size="sm" title={BUTTON_LABELS.edit}>
                  <Edit3 size={16} className="mr-1" /> {BUTTON_LABELS.edit}
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
        <p className="text-sm text-[var(--fn-text-muted)] truncate">
          {item.discipline} · {classFormatBadgeLabel(item.classFormat)} · {formatClassDate(item.startAt)}
        </p>
        <p className="text-sm text-[var(--fn-text-secondary)] truncate">{classHostLabel(item)}</p>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <span className="flex items-center gap-2 text-sm text-[var(--fn-text-muted)] min-w-0 flex-1">
            {item.modality === 'online' ? <Video size={16} className="shrink-0" /> : <MapPin size={16} className="shrink-0" />}
            <span className="truncate">{modalityLocationLabel(item.modality, item.location?.label)}</span>
          </span>
          <div className="flex items-center gap-3 shrink-0">
            {item.spotsLeft != null && !full ? (
              <span className="text-sm font-semibold text-[var(--fn-primary)]">
                {CLASS_CARD_LABELS.spotsLeft(item.spotsLeft)}
              </span>
            ) : null}
            <span className="text-xl font-bold text-[var(--fn-primary)]">{formatMoney(item.price)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (showEdit) {
    return (
      <div className="fn-class-card overflow-hidden rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-sm">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/class/${item.id}`}
      className={`fn-class-card block overflow-hidden rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--fn-primary)]/30 hover:shadow-lg ${compact ? 'mb-2' : ''}`}
    >
      {content}
    </Link>
  );
}

export const ClassCard = React.memo(ClassCardInner);
