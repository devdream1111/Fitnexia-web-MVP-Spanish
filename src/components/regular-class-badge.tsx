'use client';

import { CalendarClock, Pause } from 'lucide-react';

import { RECURRENCE_LABELS } from '@/constants/labels';
import { isRecurringClass } from '@/utils/class-series';
import type { ClassListItem } from '@/types/api';

type RegularClassBadgeProps = {
  item: Pick<ClassListItem, 'seriesId' | 'recurrenceSeriesId' | 'recurrence'>;
  size?: 'sm' | 'default';
  className?: string;
};

const boxSizes = {
  sm: 'h-6 w-6',
  default: 'h-7 w-7',
} as const;

const iconSizes = {
  sm: 13,
  default: 15,
} as const;

/** F-13 — icon-only badge for weekly series instances (clase regular) */
export function RegularClassBadge({ item, size = 'sm', className = '' }: RegularClassBadgeProps) {
  if (!isRecurringClass(item)) return null;

  const paused = item.recurrence?.paused === true;
  const Icon = paused ? Pause : CalendarClock;
  const title = paused ? RECURRENCE_LABELS.badgePaused : RECURRENCE_LABELS.regularBadgeTitle;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full shadow-sm ${
        paused
          ? 'bg-amber-500 text-white'
          : 'bg-fuchsia-500 text-white'
      } ${boxSizes[size]} ${className}`}
      title={title}
      aria-label={title}
    >
      <Icon size={iconSizes[size]} strokeWidth={2.5} className="shrink-0" aria-hidden />
    </span>
  );
}
