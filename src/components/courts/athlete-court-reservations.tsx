'use client';

import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { ALERT_LABELS, GENERAL_LABELS, MOCK_V2V3_LABELS } from '@/constants/labels';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import {
  apiCancelCourtRecurringShift,
  apiCancelCourtReservation,
  apiListAthleteCourtReservations,
  apiListMyCourtRecurringShifts,
  apiSyncCourtReservationPayment,
} from '@/services/api';
import { ApiClientError } from '@/services/api-client';
import type { CourtRecurringShift, CourtReservation } from '@/types/api';
import { formatSlotTime } from '@/utils/courts';
import { formatMoney } from '@/utils/format';

function statusLabel(status: string): string {
  if (status === 'confirmed') return 'Confirmada';
  if (status === 'pending_payment') return 'Pago pendiente';
  if (status === 'cancelled') return 'Cancelada';
  return status;
}

export function AthleteCourtReservations() {
  const { showNotice } = useNoticeModal();
  const [reservations, setReservations] = useState<CourtReservation[]>([]);
  const [shifts, setShifts] = useState<CourtRecurringShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, shiftRes] = await Promise.all([
        apiListAthleteCourtReservations(),
        apiListMyCourtRecurringShifts().catch(() => ({ data: [] as CourtRecurringShift[] })),
      ]);
      setReservations(res.data ?? []);
      setShifts((shiftRes.data ?? []).filter((s) => s.active));
    } catch (err) {
      setReservations([]);
      setShifts([]);
      setError(
        err instanceof ApiClientError
          ? err.message
          : 'No se pudieron cargar las reservas de cancha',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const cancelReservation = async (reservation: CourtReservation) => {
    if (!reservation.canCancel) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: MOCK_V2V3_LABELS.courtCancelBlocked,
        variant: 'error',
      });
      return;
    }
    setActingId(reservation.id);
    try {
      await apiCancelCourtReservation(reservation.id);
      await load();
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: MOCK_V2V3_LABELS.courtCancelOk,
        variant: 'success',
      });
    } catch (err) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: err instanceof ApiClientError ? err.message : MOCK_V2V3_LABELS.courtCancelBlocked,
        variant: 'error',
      });
    } finally {
      setActingId(null);
    }
  };

  const syncPayment = async (id: string) => {
    setActingId(id);
    try {
      await apiSyncCourtReservationPayment(id);
      await load();
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: 'Estado de pago actualizado.',
        variant: 'success',
      });
    } catch (err) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: err instanceof ApiClientError ? err.message : 'No se pudo sincronizar el pago',
        variant: 'error',
      });
    } finally {
      setActingId(null);
    }
  };

  const cancelShift = async (id: string) => {
    setActingId(id);
    try {
      await apiCancelCourtRecurringShift(id);
      await load();
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: MOCK_V2V3_LABELS.courtRecurringCancelled,
        variant: 'success',
      });
    } catch (err) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: err instanceof ApiClientError ? err.message : 'No se pudo cancelar el turno fijo',
        variant: 'error',
      });
    } finally {
      setActingId(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>;
  }

  if (error) {
    return (
      <div className="space-y-3">
        <p className="m-0 text-sm text-[var(--fn-error)]">{error}</p>
        <Button title="Reintentar" variant="outline" size="sm" onClick={() => void load()} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h3 className="m-0 font-bold text-[var(--fn-text)]">{MOCK_V2V3_LABELS.courtsMyBookings}</h3>
        {!reservations.length ? (
          <p className="m-0 text-sm text-[var(--fn-text-muted)]">No tenés reservas de cancha.</p>
        ) : (
          <ul className="m-0 list-none space-y-3 p-0">
            {reservations.map((reservation) => (
              <li
                key={reservation.id}
                className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4"
              >
                <p className="m-0 font-semibold text-[var(--fn-text)]">
                  {reservation.courtName ?? 'Cancha'}
                  {reservation.institutionName ? ` · ${reservation.institutionName}` : ''}
                </p>
                <p className="mt-1 m-0 text-sm text-[var(--fn-text-muted)]">
                  {new Date(reservation.startAt).toLocaleDateString('es-UY')} ·{' '}
                  {formatSlotTime(reservation.startAt)}–{formatSlotTime(reservation.endAt)}
                </p>
                <p className="mt-1 m-0 text-sm font-medium text-[var(--fn-text)]">
                  {formatMoney(reservation.price)} · {statusLabel(String(reservation.status))}
                </p>
                {reservation.cancellationPolicyHours != null ? (
                  <p className="mt-1 m-0 text-xs text-[var(--fn-text-muted)]">
                    {MOCK_V2V3_LABELS.courtCancelPolicy.replace(
                      '{hours}',
                      String(reservation.cancellationPolicyHours),
                    )}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {reservation.status === 'pending_payment' ? (
                    <Button
                      title="Sincronizar pago"
                      size="sm"
                      variant="outline"
                      loading={actingId === reservation.id}
                      onClick={() => void syncPayment(reservation.id)}
                    />
                  ) : null}
                  {reservation.canCancel ? (
                    <Button
                      title="Cancelar"
                      size="sm"
                      variant="outline"
                      loading={actingId === reservation.id}
                      onClick={() => void cancelReservation(reservation)}
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="m-0 font-bold text-[var(--fn-text)]">{MOCK_V2V3_LABELS.courtRecurringTitle}</h3>
        {!shifts.length ? (
          <p className="m-0 text-sm text-[var(--fn-text-muted)]">
            {MOCK_V2V3_LABELS.courtRecurringEmpty}
          </p>
        ) : (
          <ul className="m-0 list-none space-y-3 p-0">
            {shifts.map((shift) => (
              <li
                key={shift.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4"
              >
                <div>
                  <p className="m-0 font-semibold text-[var(--fn-text)]">
                    {shift.courtName ?? 'Cancha'} · {shift.weekdayLabel} {shift.startTime}
                  </p>
                  <p className="mt-1 m-0 text-sm text-[var(--fn-text-muted)]">
                    {shift.durationMinutes} min
                    {shift.nextOccurrenceAt
                      ? ` · Próximo: ${new Date(shift.nextOccurrenceAt).toLocaleString('es-UY')}`
                      : ''}
                  </p>
                </div>
                <Button
                  title="Cancelar turno fijo"
                  size="sm"
                  variant="outline"
                  loading={actingId === shift.id}
                  onClick={() => void cancelShift(shift.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
