'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ALERT_LABELS, GENERAL_LABELS, MOCK_V2V3_LABELS } from '@/constants/labels';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import {
  apiCreateCourt,
  apiDeleteCourt,
  apiListMyCourts,
} from '@/services/api';
import { ApiClientError } from '@/services/api-client';
import type { Court, CourtLocationType, CourtSportType, CourtSurface } from '@/types/api';
import {
  COURT_LOCATION_TYPES,
  COURT_SPORT_TYPES,
  COURT_SURFACES,
  courtLocationLabel,
  courtSportLabel,
  courtSurfaceLabel,
  defaultOperatingHours,
  isActiveCourt,
  summarizeOperatingHours,
} from '@/utils/courts';

export function CourtsManager({ onCourtsChange }: { onCourtsChange?: (courts: Court[]) => void }) {
  const { showNotice } = useNoticeModal();
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [sportType, setSportType] = useState<CourtSportType>('padel');
  const [surface, setSurface] = useState<CourtSurface>('synthetic');
  const [locationType, setLocationType] = useState<CourtLocationType>('outdoor');
  const [hasLighting, setHasLighting] = useState(true);
  const [openTime, setOpenTime] = useState('08:00');
  const [closeTime, setCloseTime] = useState('22:00');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiListMyCourts();
      const list = (data ?? []).filter(isActiveCourt);
      setCourts(list);
      onCourtsChange?.(list);
    } catch (err) {
      setCourts([]);
      onCourtsChange?.([]);
      setError(
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'No se pudieron cargar las canchas',
      );
    } finally {
      setLoading(false);
    }
  }, [onCourtsChange]);

  useEffect(() => {
    void load();
  }, [load]);

  const add = async () => {
    if (!name.trim()) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: 'Ingresá el nombre de la cancha.',
        variant: 'error',
      });
      return;
    }
    if (openTime >= closeTime) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: 'El horario de cierre debe ser posterior al de apertura.',
        variant: 'error',
      });
      return;
    }

    setSaving(true);
    try {
      await apiCreateCourt({
        name: name.trim(),
        sportType,
        surface,
        locationType,
        hasLighting,
        operatingHours: defaultOperatingHours(openTime, closeTime),
      });
      setName('');
      await load();
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: 'Cancha creada correctamente.',
        variant: 'success',
      });
    } catch (err) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: err instanceof ApiClientError ? err.message : 'No se pudo crear la cancha',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (court: Court) => {
    setSaving(true);
    try {
      await apiDeleteCourt(court.id);
      await load();
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: 'Cancha desactivada.',
        variant: 'success',
      });
    } catch (err) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: err instanceof ApiClientError ? err.message : 'No se pudo eliminar la cancha',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5">
        <h3 className="mb-4 m-0 font-bold text-[var(--fn-text)]">{MOCK_V2V3_LABELS.courtAdd}</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            compact
            className="mb-0"
          />
          <Select
            label={MOCK_V2V3_LABELS.courtType}
            value={sportType}
            onChange={(val) => setSportType(val as CourtSportType)}
            options={COURT_SPORT_TYPES.map((t) => ({ value: t.id, label: t.label }))}
            compact
          />
          <Select
            label={MOCK_V2V3_LABELS.courtSurface}
            value={surface}
            onChange={(val) => setSurface(val as CourtSurface)}
            options={COURT_SURFACES.map((t) => ({ value: t.id, label: t.label }))}
            compact
          />
          <Select
            label={MOCK_V2V3_LABELS.courtIndoor}
            value={locationType}
            onChange={(val) => setLocationType(val as CourtLocationType)}
            options={COURT_LOCATION_TYPES.map((t) => ({ value: t.id, label: t.label }))}
            compact
          />
          <Input
            label="Apertura"
            type="time"
            value={openTime}
            onChange={(e) => setOpenTime(e.target.value)}
            compact
            className="mb-0"
          />
          <Input
            label="Cierre"
            type="time"
            value={closeTime}
            onChange={(e) => setCloseTime(e.target.value)}
            compact
            className="mb-0"
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Checkbox
            label={MOCK_V2V3_LABELS.courtLighting}
            checked={hasLighting}
            onChange={() => setHasLighting((prev) => !prev)}
          />
          <Button title={MOCK_V2V3_LABELS.courtAdd} loading={saving} onClick={() => void add()}>
            <Plus size={16} />
          </Button>
        </div>
      </section>

      {loading ? (
        <p className="text-sm text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
      ) : null}
      {error ? <p className="text-sm text-[var(--fn-error)]">{error}</p> : null}
      {!loading && !error && courts.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--fn-border)] px-4 py-8 text-center text-sm text-[var(--fn-text-muted)]">
          Todavía no hay canchas. Agregá la primera para ver el calendario de turnos.
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {courts.map((court) => (
          <article
            key={court.id}
            className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="m-0 font-bold text-[var(--fn-text)]">{court.name}</h4>
                <p className="mt-1 m-0 text-sm text-[var(--fn-text-muted)]">
                  {courtSportLabel(court.sportType)} · {courtSurfaceLabel(court.surface)}
                </p>
              </div>
              <button
                type="button"
                className="rounded-full p-2 text-[var(--fn-text-muted)] hover:bg-[var(--fn-primary-muted)] hover:text-[var(--fn-primary-text)]"
                aria-label="Desactivar cancha"
                disabled={saving}
                onClick={() => void remove(court)}
              >
                <Trash2 size={16} />
              </button>
            </div>
            <ul className="mt-3 m-0 list-none space-y-1 p-0 text-xs text-[var(--fn-text-secondary)]">
              <li>
                {courtLocationLabel(court.locationType)} ·{' '}
                {court.hasLighting ? 'Con iluminación' : 'Sin iluminación'}
              </li>
              <li>
                {MOCK_V2V3_LABELS.courtHours}: {summarizeOperatingHours(court.operatingHours)}
              </li>
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
