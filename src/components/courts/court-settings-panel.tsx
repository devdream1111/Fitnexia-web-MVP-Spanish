'use client';

import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ALERT_LABELS, GENERAL_LABELS, MOCK_V2V3_LABELS } from '@/constants/labels';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import { apiGetCourtSettings, apiUpdateCourtSettings } from '@/services/api';
import { ApiClientError } from '@/services/api-client';

export function CourtSettingsPanel() {
  const { showNotice } = useNoticeModal();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cancelHours, setCancelHours] = useState('24');
  const [slotMinutes, setSlotMinutes] = useState('60');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const settings = await apiGetCourtSettings();
      setCancelHours(String(settings.cancellationPolicyHours ?? 24));
      setSlotMinutes(String(settings.defaultSlotMinutes ?? 60));
    } catch {
      /* keep defaults */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    const hours = Number(cancelHours);
    const minutes = Number(slotMinutes);
    if (!Number.isFinite(hours) || hours < 0 || !Number.isFinite(minutes) || minutes < 15) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: 'Revisá la política de cancelación y la duración del turno.',
        variant: 'error',
      });
      return;
    }
    setSaving(true);
    try {
      await apiUpdateCourtSettings({
        cancellationPolicyHours: hours,
        defaultSlotMinutes: minutes,
      });
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: MOCK_V2V3_LABELS.courtSettingsSaved,
        variant: 'success',
      });
    } catch (err) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: err instanceof ApiClientError ? err.message : 'No se pudo guardar',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>;
  }

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5">
      <h3 className="m-0 font-bold text-[var(--fn-text)]">{MOCK_V2V3_LABELS.courtSettingsTitle}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Cancelación (horas antes)"
          type="number"
          min={0}
          value={cancelHours}
          onChange={(e) => setCancelHours(e.target.value)}
          compact
        />
        <Input
          label="Duración de turno (minutos)"
          type="number"
          min={15}
          step={15}
          value={slotMinutes}
          onChange={(e) => setSlotMinutes(e.target.value)}
          compact
        />
      </div>
      <Button title="Guardar política" loading={saving} onClick={() => void save()} />
    </section>
  );
}
