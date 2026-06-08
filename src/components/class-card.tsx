'use client';

import Link from 'next/link';
import { Dumbbell, Video, MapPin, Edit3 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BADGE_LABELS, CLASS_CARD_LABELS, modalityLocationLabel, BUTTON_LABELS } from '@/constants/labels';
import { formatClassDate, formatMoney } from '@/data/mock';
import type { ClassListItem } from '@/types/api';

export function ClassCard({ item, compact, showEdit, editHref }: { 
  item: ClassListItem; 
  compact?: boolean;
  showEdit?: boolean;
  editHref?: string;
}) {
  const full = item.spotsLeft === 0;
  const CardContent = () => (
    <div className="flex flex-col gap-4 rounded-2xl bg-[var(--fn-surface)] p-6 shadow-sm transition-all md:flex-row hover:shadow-lg">
      <div className="flex h-28 w-full shrink-0 items-center justify-center rounded-2xl bg-[var(--fn-primary-muted)] md:w-28 animate-float" style={{ animationDelay: '0.1s' }}>
        <Dumbbell size={36} className="text-[var(--fn-primary)]" />
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-[var(--fn-text)]">{item.title}</h3>
          <div className="flex items-center gap-2">
            {full ? <Badge label={BADGE_LABELS.full} variant="warning" /> : null}
            {showEdit && editHref ? (
              <Link href={editHref} onClick={(e) => e.stopPropagation()}>
                <Button variant="outline" size="sm" title={BUTTON_LABELS.edit} className="hover:animate-pulse-glow">
                  <Edit3 size={16} className="mr-1" /> {BUTTON_LABELS.edit}
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
        <p className="text-sm text-[var(--fn-text-muted)]">
          {item.discipline} · {formatClassDate(item.startAt)}
        </p>
        <p className="text-sm text-[var(--fn-text-secondary)]">{item.instructor.displayName}</p>
        <div className="flex items-center justify-between pt-2">
          <span className="flex items-center gap-2 text-sm text-[var(--fn-text-muted)]">
            {item.modality === 'online' ? <Video size={16} /> : <MapPin size={16} />}
            {modalityLocationLabel(item.modality, item.location?.label)}
          </span>
          <div className="flex items-center gap-3">
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
    return <CardContent />;
  }

  return (
    <Link
      href={`/class/${item.id}`}
      className={`transition-all hover:-translate-y-1 hover:shadow-xl ${compact ? 'mb-2' : ''}`}>
      <CardContent />
    </Link>
  );
}
