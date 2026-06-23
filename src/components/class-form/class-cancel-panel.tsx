'use client';

import { AlertTriangle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { BUTTON_LABELS, GENERAL_LABELS, INSTRUCTOR_LABELS } from '@/constants/labels';

export function ClassCancelPanel({
  onCancel,
  loading,
}: {
  onCancel: () => void | Promise<void>;
  loading?: boolean;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const closeConfirm = useCallback(() => {
    if (loading) return;
    setConfirmOpen(false);
  }, [loading]);

  useEffect(() => {
    if (!confirmOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeConfirm();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [confirmOpen, closeConfirm]);

  const handleConfirm = async () => {
    await onCancel();
  };

  return (
    <>
      <section className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6">
        <div className="flex gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-red-600">
            <AlertTriangle size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-[var(--fn-text)]">
              {INSTRUCTOR_LABELS.classForm.cancelPanelTitle}
            </h3>
            <p className="mt-1 text-sm text-[var(--fn-text-muted)]">
              {INSTRUCTOR_LABELS.classForm.cancelPanelHint}
            </p>
            <Button
              title={BUTTON_LABELS.cancelClass}
              variant="outline"
              className="mt-4 border-red-500/40 text-red-600 hover:bg-red-500/10"
              loading={loading}
              onClick={() => setConfirmOpen(true)}
            />
          </div>
        </div>
      </section>

      {confirmOpen ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-[var(--fn-text)]/40 backdrop-blur-[2px]"
            onClick={closeConfirm}
            aria-label="Cerrar"
            disabled={loading}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="class-cancel-modal-title"
            className="relative z-10 w-full max-w-md rounded-t-2xl border border-[var(--fn-border)] bg-[var(--fn-bg)] p-6 shadow-2xl sm:rounded-2xl"
          >
            <div className="flex gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-red-600">
                <AlertTriangle size={22} />
              </span>
              <div className="min-w-0">
                <h2
                  id="class-cancel-modal-title"
                  className="text-lg font-semibold text-[var(--fn-text)]"
                >
                  {INSTRUCTOR_LABELS.classForm.cancelConfirmTitle}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--fn-text-muted)]">
                  {INSTRUCTOR_LABELS.classForm.cancelConfirmMessage}
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                title={INSTRUCTOR_LABELS.classForm.keepClass}
                variant="outline"
                onClick={closeConfirm}
                disabled={loading}
              />
              <Button
                title={GENERAL_LABELS.confirmCancel}
                variant="danger"
                loading={loading}
                onClick={handleConfirm}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
