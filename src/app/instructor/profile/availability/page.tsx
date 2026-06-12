'use client';

import { useEffect, useState } from 'react';
import { CalendarClock, Zap } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import { apiSetAvailableNow } from '@/services/api';
import { ALERT_LABELS, PROFILE_MENU_LABELS, PROFILE_PAGE_LABELS } from '@/constants/labels';

export default function AvailabilityPage() {
  const { user, updateProfile } = useAuth();
  const { showNotice } = useNoticeModal();
  const [availableNow, setAvailableNow] = useState(
    user?.instructorProfile?.availableNow ?? false,
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAvailableNow(user?.instructorProfile?.availableNow ?? false);
  }, [user?.instructorProfile?.availableNow]);

  const toggleAvailableNow = async () => {
    const next = !availableNow;
    setSaving(true);
    try {
      await apiSetAvailableNow(next);
      await updateProfile({ instructorProfile: { availableNow: next } });
      setAvailableNow(next);
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: next ? PROFILE_PAGE_LABELS.availableNow : PROFILE_PAGE_LABELS.notAvailable,
        variant: 'success',
      });
    } catch {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: 'No se pudo actualizar la disponibilidad.',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title={PROFILE_MENU_LABELS.scheduleAvailability} showBack />

      <section className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600">
            <Zap size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-[var(--fn-text)]">Disponible ahora</h2>
            <p className="mt-1 text-sm text-[var(--fn-text-muted)]">
              Indica a los atletas que puedes aceptar sesiones en este momento.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  availableNow
                    ? 'bg-emerald-500/15 text-emerald-700'
                    : 'bg-[var(--fn-surface-muted)] text-[var(--fn-text-muted)]'
                }`}
              >
                {availableNow ? PROFILE_PAGE_LABELS.availableNow : PROFILE_PAGE_LABELS.notAvailable}
              </span>
              <Button
                title={availableNow ? 'Desactivar' : 'Activar'}
                size="sm"
                loading={saving}
                onClick={toggleAvailableNow}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/30 p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]">
            <CalendarClock size={22} />
          </span>
          <div>
            <h2 className="font-bold text-[var(--fn-text)]">Horario semanal</h2>
            <p className="mt-1 text-sm leading-relaxed text-[var(--fn-text-muted)]">
              El editor de disponibilidad semanal estará disponible próximamente. Mientras tanto, crea
              clases con fecha y hora específicas desde tu panel.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
