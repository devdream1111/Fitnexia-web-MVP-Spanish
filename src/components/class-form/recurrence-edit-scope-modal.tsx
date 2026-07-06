'use client';

import { Button } from '@/components/ui/button';
import { RECURRENCE_LABELS } from '@/constants/labels';

export type RecurrenceEditScope = import('@/utils/class-series').RecurrenceEditScope;

export function RecurrenceEditScopeModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (scope: RecurrenceEditScope) => void;
}) {
  if (!open) return null;

  return (
    <div className="fn-modal-overlay flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--fn-text)]/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Cerrar"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="fn-modal-panel relative z-10 w-full max-w-md rounded-t-2xl border border-[var(--fn-border)] bg-[var(--fn-bg)] p-6 shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-[var(--fn-text)]">{RECURRENCE_LABELS.editScopeTitle}</h3>
        <p className="mt-2 text-sm text-[var(--fn-text-muted)]">{RECURRENCE_LABELS.editScopeHint}</p>
        <div className="mt-6 flex flex-col gap-2">
          <Button
            title={RECURRENCE_LABELS.editScopeSingle}
            variant="outline"
            className="w-full justify-center"
            onClick={() => onConfirm('single')}
          />
          <Button
            title={RECURRENCE_LABELS.editScopeFollowing}
            className="w-full justify-center"
            onClick={() => onConfirm('following')}
          />
        </div>
      </div>
    </div>
  );
}
