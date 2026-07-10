'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ALERT_LABELS, GENERAL_LABELS, MOCK_V2V3_LABELS } from '@/constants/labels';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import {
  apiCreateCourtRecurringShift,
  apiCreateCourtReservation,
  apiGetInstitutionCourtSchedule,
  apiGetInstitutionCourtSettings,
  apiListInstitutionCourts,
  apiListMyClubMemberships,
  apiQuoteCourtReservation,
} from '@/services/api';
import { ApiClientError } from '@/services/api-client';
import type {
  AthleteClubMembership,
  Court,
  CourtQuoteResponse,
  CourtScheduleSlot,
} from '@/types/api';
import { normalizeAthleteMembershipsList } from '@/utils/club-members';
import { formatSlotTime, localDateInputValue } from '@/utils/courts';
import { formatMoney } from '@/utils/format';

export function AthleteCourtBookingFlow() {
  const router = useRouter();
  const { showNotice } = useNoticeModal();
  const [memberships, setMemberships] = useState<AthleteClubMembership[]>([]);
  const [institutionId, setInstitutionId] = useState('');
  const [courts, setCourts] = useState<Court[]>([]);
  const [courtId, setCourtId] = useState('');
  const [date, setDate] = useState(localDateInputValue());
  const [slots, setSlots] = useState<CourtScheduleSlot[]>([]);
  const [slotMinutes, setSlotMinutes] = useState(60);
  const [cancelHours, setCancelHours] = useState(24);
  const [selectedStartAt, setSelectedStartAt] = useState<string | null>(null);
  const [quote, setQuote] = useState<CourtQuoteResponse | null>(null);
  const [makeRecurring, setMakeRecurring] = useState(false);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [quoting, setQuoting] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCourt = useMemo(
    () => courts.find((c) => c.id === courtId) ?? null,
    [courts, courtId],
  );

  useEffect(() => {
    let cancelled = false;
    setLoadingClubs(true);
    apiListMyClubMemberships()
      .then((res) => {
        if (cancelled) return;
        const list = normalizeAthleteMembershipsList(res);
        setMemberships(list);
        if (list[0]?.institutionId) setInstitutionId(list[0].institutionId);
      })
      .catch(() => {
        if (!cancelled) setMemberships([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingClubs(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!institutionId) {
      setCourts([]);
      setCourtId('');
      return;
    }
    let cancelled = false;
    Promise.all([
      apiListInstitutionCourts(institutionId),
      apiGetInstitutionCourtSettings(institutionId),
    ])
      .then(([courtsRes, settings]) => {
        if (cancelled) return;
        const list = courtsRes.data ?? [];
        setCourts(list);
        setCourtId((prev) => (prev && list.some((c) => c.id === prev) ? prev : list[0]?.id ?? ''));
        setSlotMinutes(settings.defaultSlotMinutes ?? 60);
        setCancelHours(settings.cancellationPolicyHours ?? 24);
      })
      .catch((err) => {
        if (cancelled) return;
        setCourts([]);
        setCourtId('');
        setError(err instanceof ApiClientError ? err.message : 'No se pudieron cargar las canchas');
      });
    return () => {
      cancelled = true;
    };
  }, [institutionId]);

  const loadSlots = useCallback(async () => {
    if (!institutionId || !courtId || !date) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    setError(null);
    setSelectedStartAt(null);
    setQuote(null);
    try {
      const { data } = await apiGetInstitutionCourtSchedule(institutionId, {
        date,
        courtId,
      });
      const day = data?.[0];
      setSlots(day?.slots ?? []);
      if (day?.slotMinutes) setSlotMinutes(day.slotMinutes);
    } catch (err) {
      setSlots([]);
      setError(err instanceof ApiClientError ? err.message : 'No se pudo cargar la disponibilidad');
    } finally {
      setLoadingSlots(false);
    }
  }, [courtId, date, institutionId]);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  useEffect(() => {
    if (!selectedStartAt || !courtId) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    setQuoting(true);
    apiQuoteCourtReservation({
      courtId,
      startAt: selectedStartAt,
      durationMinutes: slotMinutes,
    })
      .then((result) => {
        if (!cancelled) setQuote(result);
      })
      .catch((err) => {
        if (cancelled) return;
        setQuote(null);
        setError(err instanceof ApiClientError ? err.message : 'No se pudo cotizar el turno');
      })
      .finally(() => {
        if (!cancelled) setQuoting(false);
      });
    return () => {
      cancelled = true;
    };
  }, [courtId, selectedStartAt, slotMinutes]);

  const confirm = async () => {
    if (!selectedStartAt || !courtId) return;
    setBooking(true);
    setError(null);
    try {
      let recurringShiftId: string | undefined;
      if (makeRecurring) {
        const start = new Date(selectedStartAt);
        const shift = await apiCreateCourtRecurringShift({
          courtId,
          weekday: start.getDay(),
          startTime: formatSlotTime(selectedStartAt),
          durationMinutes: slotMinutes,
        });
        recurringShiftId = shift.id;
      }

      const result = await apiCreateCourtReservation({
        courtId,
        startAt: selectedStartAt,
        durationMinutes: slotMinutes,
        recurringShiftId,
      });

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }

      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: MOCK_V2V3_LABELS.courtBookingConfirmed,
        variant: 'success',
      });
      router.push('/athlete/court-bookings');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'No se pudo completar la reserva');
    } finally {
      setBooking(false);
    }
  };

  if (loadingClubs) {
    return <p className="text-sm text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>;
  }

  if (!memberships.length) {
    return (
      <div className="space-y-4 rounded-2xl border border-dashed border-[var(--fn-border)] px-6 py-10 text-center">
        <p className="m-0 text-sm text-[var(--fn-text-muted)]">{MOCK_V2V3_LABELS.courtNoClubs}</p>
        <Button
          title="Ver membresías"
          variant="outline"
          onClick={() => router.push('/athlete/club-membership')}
        />
      </div>
    );
  }

  const freeSlots = slots.filter((s) => s.available);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Club"
          value={institutionId}
          onChange={setInstitutionId}
          options={memberships.map((m) => ({
            value: m.institutionId,
            label: m.institutionName,
          }))}
        />
        <Select
          label="Cancha"
          value={courtId}
          onChange={setCourtId}
          options={courts.map((c) => ({ value: c.id, label: c.name }))}
        />
        <Input
          label="Fecha"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          compact
        />
      </div>

      {selectedCourt ? (
        <p className="m-0 flex items-center gap-2 text-sm text-[var(--fn-text-muted)]">
          <MapPin size={14} />
          {MOCK_V2V3_LABELS.courtCancelPolicy.replace('{hours}', String(cancelHours))}
        </p>
      ) : null}

      {error ? <p className="m-0 text-sm text-[var(--fn-error)]">{error}</p> : null}

      {loadingSlots ? (
        <p className="text-sm text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
      ) : freeSlots.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--fn-border)] px-4 py-8 text-center text-sm text-[var(--fn-text-muted)]">
          {MOCK_V2V3_LABELS.courtNoSlots}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {freeSlots.map((slot) => {
            const selected = selectedStartAt === slot.startAt;
            return (
              <button
                key={slot.startAt}
                type="button"
                onClick={() => setSelectedStartAt(slot.startAt)}
                className={`rounded-xl border p-4 text-left transition ${
                  selected
                    ? 'border-[var(--fn-primary)] bg-[var(--fn-primary-muted)]'
                    : 'border-[var(--fn-border)] bg-[var(--fn-surface)] hover:bg-[var(--fn-calendar-hover)]'
                }`}
              >
                <p className="m-0 font-semibold text-[var(--fn-text)]">
                  {formatSlotTime(slot.startAt)}–{formatSlotTime(slot.endAt)}
                </p>
                <p className="mt-1 m-0 text-xs text-[var(--fn-text-muted)]">{slotMinutes} min</p>
              </button>
            );
          })}
        </div>
      )}

      {selectedStartAt ? (
        <section className="space-y-4 rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5">
          <Checkbox
            label={MOCK_V2V3_LABELS.courtRecurringShift}
            checked={makeRecurring}
            onChange={() => setMakeRecurring((v) => !v)}
          />
          {quoting ? (
            <p className="m-0 text-sm text-[var(--fn-text-muted)]">
              {MOCK_V2V3_LABELS.courtQuoteLoading}
            </p>
          ) : quote ? (
            <div className="space-y-1 text-sm">
              <p className="m-0 font-bold text-[var(--fn-text)]">
                Total: {formatMoney(quote.appliedPrice)}
                {quote.isMemberRate ? ' (tarifa socio)' : ''}
              </p>
              <p className="m-0 text-xs text-[var(--fn-text-muted)]">
                Socio {formatMoney(quote.memberPrice)} · No socio{' '}
                {formatMoney(quote.nonMemberPrice)}
              </p>
            </div>
          ) : null}
          <Button
            title={MOCK_V2V3_LABELS.courtBookShift}
            loading={booking}
            disabled={!quote || quoting}
            onClick={() => void confirm()}
          />
        </section>
      ) : null}
    </div>
  );
}
