'use client';

import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { INSTRUCTOR_LABELS, BUTTON_LABELS } from '@/constants/labels';

export function ClassCancelPanel({
  onCancel,
  loading,
}: {
  onCancel: () => void;
  loading?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-red-600">
          <AlertTriangle size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-[var(--fn-text)]">Cancelar clase</h3>
          <p className="mt-1 text-sm text-[var(--fn-text-muted)]">
            Esta acción cancela la clase para todos los participantes. No se puede deshacer.
          </p>
          <Button
            title={BUTTON_LABELS.cancelClass}
            variant="outline"
            className="mt-4 border-red-500/40 text-red-600 hover:bg-red-500/10"
            loading={loading}
            onClick={onCancel}
          />
        </div>
      </div>
    </section>
  );
}
