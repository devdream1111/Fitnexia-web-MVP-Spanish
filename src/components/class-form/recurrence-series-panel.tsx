'use client';

import { useState } from 'react';
import { Pause, Play, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { RECURRENCE_LABELS } from '@/constants/labels';
import { formatRecurrenceWeekdays } from '@/utils/class-recurrence';
import { formatSeriesTime } from '@/utils/class-series';
import type { ClassSeries } from '@/types/api';
import {
  SeriesActionConfirmModal,
  type SeriesConfirmAction,
} from '@/components/class-form/series-action-confirm-modal';

export function RecurrenceSeriesPanel({
  series,
  instanceCount,
  onPause,
  onResume,
  onDelete,
  busy,
}: {
  series: ClassSeries;
  instanceCount: number;
  onPause: () => void | Promise<void>;
  onResume: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  busy?: 'pause' | 'delete' | null;
}) {
  const paused = series.status === 'paused';
  const [confirmAction, setConfirmAction] = useState<SeriesConfirmAction | null>(null);

  const handleConfirm = async () => {
    if (confirmAction === 'pause') {
      await onPause();
    } else if (confirmAction === 'delete') {
      await onDelete();
    }
    setConfirmAction(null);
  };

  return (
    <>
      <section className="rounded-2xl border border-violet-500/25 bg-violet-500/5 p-5">
        <h3 className="font-bold text-[var(--fn-text)]">{RECURRENCE_LABELS.seriesActionsTitle}</h3>
        <p className="mt-1 text-sm text-[var(--fn-text-muted)]">
          {formatRecurrenceWeekdays(series.weekdays)} · {formatSeriesTime(series.timeOfDay)} ·{' '}
          {instanceCount} sesiones
          {paused ? ` · ${RECURRENCE_LABELS.badgePaused}` : ''}
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {paused ? (
            <Button
              title={RECURRENCE_LABELS.resumeSeries}
              variant="outline"
              size="sm"
              loading={busy === 'pause'}
              onClick={() => void onResume()}
            >
              <Play size={16} className="mr-2" />
              {RECURRENCE_LABELS.resumeSeries}
            </Button>
          ) : (
            <Button
              title={RECURRENCE_LABELS.pauseSeries}
              variant="outline"
              size="sm"
              loading={busy === 'pause'}
              onClick={() => setConfirmAction('pause')}
            >
              <Pause size={16} className="mr-2" />
              {RECURRENCE_LABELS.pauseSeries}
            </Button>
          )}
          <Button
            title={RECURRENCE_LABELS.deleteSeries}
            variant="danger"
            size="sm"
            loading={busy === 'delete'}
            onClick={() => setConfirmAction('delete')}
          >
            <Trash2 size={16} className="mr-2" />
            {RECURRENCE_LABELS.deleteSeries}
          </Button>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-[var(--fn-text-muted)]">
          {RECURRENCE_LABELS.deleteSeriesHint}
        </p>
      </section>

      <SeriesActionConfirmModal
        action={confirmAction}
        loading={busy === confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
