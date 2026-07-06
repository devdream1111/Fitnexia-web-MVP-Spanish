'use client';

import { useEffect, useState } from 'react';
import { CalendarClock, Zap } from 'lucide-react';

import { WeeklyScheduleEditor } from '@/components/mock-v2v3/weekly-schedule-editor';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { IS_MOCK_V2V3_ENABLED } from '@/config/mock-v2v3';
import { useAuth } from '@/contexts/auth-context';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import { useFeature } from '@/hooks/use-feature';
import { mockAvailabilityService } from '@/services/mock/availability.mock';
import { apiSetAvailableNow } from '@/services/api';
import { getLinkedInstructorId } from '@/utils/instructor';
import {
  ALERT_LABELS,
  MOCK_V2V3_LABELS,
  PROFILE_MENU_LABELS,
  PROFILE_PAGE_LABELS,
} from '@/constants/labels';

export default function AvailabilityPage() {
  const { user, updateProfile } = useAuth();
  const { showNotice } = useNoticeModal();
  const weeklyMockEnabled = useFeature('instructorAvailability') && IS_MOCK_V2V3_ENABLED;
  const instructorId = getLinkedInstructorId(user);
  const [availableNow, setAvailableNow] = useState(
    user?.instructorProfile?.availableNow ?? false,
  );
  const [saving, setSaving] = useState(false);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [schedule, setSchedule] = useState(() =>
    instructorId ? mockAvailabilityService.getSchedule(instructorId) : [],
  );

  useEffect(() => {
    setAvailableNow(user?.instructorProfile?.availableNow ?? false);
  }, [user?.instructorProfile?.availableNow]);

  useEffect(() => {
    if (instructorId && weeklyMockEnabled) {
      setSchedule(mockAvailabilityService.getSchedule(instructorId));
    }
  }, [instructorId, weeklyMockEnabled]);

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

  const saveSchedule = async (next: typeof schedule) => {
    if (!instructorId) return;
    setScheduleSaving(true);
    try {
      mockAvailabilityService.saveSchedule(instructorId, next);
      setSchedule(next);
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: MOCK_V2V3_LABELS.weeklyScheduleSaved,
        variant: 'success',
      });
    } finally {
      setScheduleSaving(false);
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

      {weeklyMockEnabled && instructorId ? (
        <WeeklyScheduleEditor
          initialSchedule={schedule}
          onSave={saveSchedule}
          saving={scheduleSaving}
        />
      ) : (
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
      )}
    </div>
  );
}
