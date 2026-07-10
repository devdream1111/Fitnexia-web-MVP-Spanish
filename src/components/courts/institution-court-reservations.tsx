'use client';

import { useCallback, useEffect, useState } from 'react';
import { Users } from 'lucide-react';

import { GENERAL_LABELS } from '@/constants/labels';
import { apiListMyCourtReservations } from '@/services/api';
import { ApiClientError } from '@/services/api-client';
import type { CourtReservation } from '@/types/api';
import { formatSlotTime, localDateInputValue } from '@/utils/courts';
import { formatMoney } from '@/utils/format';

export function InstitutionCourtReservations({ date }: { date?: string }) {
  const [reservations, setReservations] = useState<CourtReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const selectedDate = date ?? localDateInputValue();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiListMyCourtReservations({ date: selectedDate });
      setReservations(data ?? []);
    } catch (err) {
      setReservations([]);
      setError(
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'No se pudieron cargar las reservas',
      );
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <p className="m-0 text-sm text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>;
  }

  if (error) {
    return <p className="m-0 text-sm text-[var(--fn-error)]">{error}</p>;
  }

  if (!reservations.length) {
    return (
      <p className="m-0 flex items-center gap-2 text-sm text-[var(--fn-text-muted)]">
        <Users size={16} /> Sin reservas de cancha para esta fecha.
      </p>
    );
  }

  return (
    <ul className="m-0 list-none space-y-2 p-0">
      {reservations.map((reservation) => (
        <li
          key={reservation.id}
          className="rounded-lg border border-[var(--fn-border)] px-4 py-3 text-sm"
        >
          <span className="font-semibold text-[var(--fn-text)]">
            {reservation.courtName ?? 'Cancha'}
          </span>
          <span className="text-[var(--fn-text-muted)]">
            {' '}
            — {formatSlotTime(reservation.startAt)}–{formatSlotTime(reservation.endAt)} ·{' '}
            {reservation.status}
          </span>
          {reservation.price ? (
            <span className="mt-1 block text-xs font-medium text-[var(--fn-text-secondary)]">
              {formatMoney(reservation.price)}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
