'use client';

import { useCallback, useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import { GENERAL_LABELS, MOCK_V2V3_LABELS } from '@/constants/labels';
import { apiGetMyCourtSchedule } from '@/services/api';
import { ApiClientError } from '@/services/api-client';
import type { Court, CourtScheduleDay } from '@/types/api';
import { formatSlotTime, localDateInputValue } from '@/utils/courts';

export function CourtScheduleGrid({
  court,
  date,
  onDateChange,
}: {
  court: Court;
  date?: string;
  onDateChange?: (date: string) => void;
}) {
  const [selectedDate, setSelectedDate] = useState(date ?? localDateInputValue());
  const [day, setDay] = useState<CourtScheduleDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (date && date !== selectedDate) setSelectedDate(date);
  }, [date, selectedDate]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiGetMyCourtSchedule({
        date: selectedDate,
        courtId: court.id,
      });
      setDay(data?.[0] ?? null);
    } catch (err) {
      setDay(null);
      setError(
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'No se pudo cargar el calendario',
      );
    } finally {
      setLoading(false);
    }
  }, [court.id, selectedDate]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDateChange = (next: string) => {
    setSelectedDate(next);
    onDateChange?.(next);
  };

  return (
    <section className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h3 className="m-0 font-bold text-[var(--fn-text)]">
          {court.name} — {MOCK_V2V3_LABELS.courtSchedule}
        </h3>
        <Input
          label="Fecha"
          type="date"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          compact
          className="mb-0 w-auto min-w-[10rem]"
        />
      </div>

      {loading ? (
        <p className="m-0 text-sm text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
      ) : null}
      {error ? <p className="m-0 text-sm text-[var(--fn-error)]">{error}</p> : null}
      {!loading && !error && (!day || day.slots.length === 0) ? (
        <p className="m-0 text-sm text-[var(--fn-text-muted)]">
          No hay turnos para esta fecha (cancha cerrada o sin horario operativo).
        </p>
      ) : null}

      {day && day.slots.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {day.slots.map((slot) => (
            <div
              key={`${slot.startAt}-${slot.endAt}`}
              className={`rounded-xl border p-3 text-sm ${
                slot.available
                  ? 'border-[color-mix(in_srgb,var(--fn-primary)_30%,var(--fn-border))] bg-[color-mix(in_srgb,var(--fn-primary-muted)_55%,var(--fn-surface))]'
                  : 'border-[var(--fn-border)] bg-[var(--fn-surface-muted)] opacity-70'
              }`}
            >
              <p className="m-0 font-semibold text-[var(--fn-text)]">
                {formatSlotTime(slot.startAt)}–{formatSlotTime(slot.endAt)}
              </p>
              <p className="mt-1 m-0 text-xs text-[var(--fn-text-muted)]">
                {slot.available ? 'Libre' : 'Ocupado'} · {day.slotMinutes} min
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
