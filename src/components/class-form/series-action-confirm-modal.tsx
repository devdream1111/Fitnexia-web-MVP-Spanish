'use client';

import { useCallback, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, Pause } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ModalPortal } from '@/components/ui/modal-portal';
import { GENERAL_LABELS, RECURRENCE_LABELS } from '@/constants/labels';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';

export type SeriesConfirmAction = 'pause' | 'delete';

const CONFIG: Record<
  SeriesConfirmAction,
  {
    title: string;
    message: string;
    confirmLabel: string;
    Icon: LucideIcon;
    iconClass: string;
    confirmVariant: 'primary' | 'danger';
  }
> = {
  pause: {
    title: RECURRENCE_LABELS.pauseSeriesConfirm,
    message: RECURRENCE_LABELS.pauseSeriesHint,
    confirmLabel: RECURRENCE_LABELS.pauseSeries,
    Icon: Pause,
    iconClass: 'bg-amber-500/15 text-amber-600',
    confirmVariant: 'primary',
  },
  delete: {
    title: RECURRENCE_LABELS.deleteSeriesConfirm,
    message: RECURRENCE_LABELS.deleteSeriesHint,
    confirmLabel: RECURRENCE_LABELS.deleteSeries,
    Icon: AlertTriangle,
    iconClass: 'bg-red-500/15 text-red-600',
    confirmVariant: 'danger',
  },
};

export function SeriesActionConfirmModal({
  action,
  loading,
  onClose,
  onConfirm,
}: {
  action: SeriesConfirmAction | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  const close = useCallback(() => {
    if (loading) return;
    onClose();
  }, [loading, onClose]);

  useBodyScrollLock(Boolean(action));

  useEffect(() => {
    if (!action) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [action, close]);

  if (!action) return null;

  const { title, message, confirmLabel, Icon, iconClass, confirmVariant } = CONFIG[action];

  return (
    <ModalPortal>
      <div className="fn-modal-overlay fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6">
        <button
          type="button"
          className="absolute inset-0 bg-[var(--fn-text)]/40 backdrop-blur-[2px]"
          onClick={close}
          aria-label="Cerrar"
          disabled={loading}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="series-action-modal-title"
          className="fn-modal-panel relative z-10 w-full max-w-md rounded-t-2xl border border-[var(--fn-border)] bg-[var(--fn-bg)] p-6 shadow-2xl sm:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-3">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
            >
              <Icon size={22} />
            </span>
            <div className="min-w-0">
              <h2 id="series-action-modal-title" className="text-lg font-semibold text-[var(--fn-text)]">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--fn-text-muted)]">{message}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button title={GENERAL_LABELS.cancel} variant="outline" onClick={close} disabled={loading} />
            <Button
              title={confirmLabel}
              variant={confirmVariant}
              loading={loading}
              onClick={() => void onConfirm()}
            />
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
