'use client';

import { useState } from 'react';
import { MapPin, Plus, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { MOCK_V2V3_LABELS } from '@/constants/labels';
import {
  mockCourtsService,
  type CourtType,
  type MockCourt,
  type MockCourtSlot,
} from '@/services/mock/courts.mock';
import { formatMoneyFromCents } from '@/utils/format';
import { DEFAULT_CURRENCY } from '@/constants/fitnexia';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import { ALERT_LABELS } from '@/constants/labels';

const COURT_TYPES: { id: CourtType; label: string }[] = [
  { id: 'padel', label: MOCK_V2V3_LABELS.courtTypes.padel },
  { id: 'tennis', label: MOCK_V2V3_LABELS.courtTypes.tennis },
  { id: 'football_5', label: MOCK_V2V3_LABELS.courtTypes.football_5 },
  { id: 'football_7', label: MOCK_V2V3_LABELS.courtTypes.football_7 },
  { id: 'rugby', label: MOCK_V2V3_LABELS.courtTypes.rugby },
];

export function CourtsManager({ institutionId }: { institutionId: string }) {
  const [courts, setCourts] = useState(() => mockCourtsService.listCourts(institutionId));
  const [name, setName] = useState('');
  const [type, setType] = useState<CourtType>('padel');

  const add = () => {
    if (!name.trim()) return;
    const court = mockCourtsService.addCourt(institutionId, {
      name: name.trim(),
      type,
      surface: 'Césped sintético',
      indoor: false,
      hasLighting: true,
      openTime: '08:00',
      closeTime: '22:00',
      shiftMinutes: 90,
      peakPriceCents: 400000,
      offPeakPriceCents: 300000,
      memberPriceCents: 250000,
      guestPriceCents: 400000,
      cancelHours: 24,
    });
    setCourts((prev) => [...prev, court]);
    setName('');
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5">
        <h3 className="mb-4 font-bold">{MOCK_V2V3_LABELS.courtAdd}</h3>
        <div className="grid gap-4 sm:grid-cols-3 sm:items-end">
          <Input
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            compact
            className="mb-0 h-12"
          />
          <Select
            label={MOCK_V2V3_LABELS.courtType}
            value={type}
            onChange={(val) => setType(val as CourtType)}
            options={COURT_TYPES.map((t) => ({ value: t.id, label: t.label }))}
            compact
          />
          <div className="w-full">
            <span
              className="mb-1.5 hidden text-sm font-medium sm:block sm:invisible"
              aria-hidden="true"
            >
              {MOCK_V2V3_LABELS.courtAdd}
            </span>
            <Button
              title={MOCK_V2V3_LABELS.courtAdd}
              className="w-full"
              onClick={add}
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {courts.map((court) => (
          <CourtCard key={court.id} court={court} />
        ))}
      </div>
    </div>
  );
}

function CourtCard({ court }: { court: MockCourt }) {
  const typeLabel = MOCK_V2V3_LABELS.courtTypes[court.type] ?? court.type;
  return (
    <article className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5">
      <h4 className="font-bold text-[var(--fn-text)]">{court.name}</h4>
      <p className="mt-1 text-sm text-[var(--fn-text-muted)]">{typeLabel} · {court.surface}</p>
      <ul className="mt-3 space-y-1 text-xs text-[var(--fn-text-secondary)]">
        <li>{court.indoor ? 'Interior' : 'Exterior'} · {court.hasLighting ? 'Con iluminación' : 'Sin iluminación'}</li>
        <li>{MOCK_V2V3_LABELS.courtHours}: {court.openTime}–{court.closeTime}</li>
        <li>{MOCK_V2V3_LABELS.courtPeakPrice}: {formatMoneyFromCents(court.peakPriceCents, DEFAULT_CURRENCY)}</li>
        <li>{MOCK_V2V3_LABELS.courtMemberPrice}: {formatMoneyFromCents(court.memberPriceCents, DEFAULT_CURRENCY)}</li>
      </ul>
    </article>
  );
}

export function CourtScheduleGrid({ court }: { court: MockCourt }) {
  const date = new Date().toISOString().slice(0, 10);
  const slots = mockCourtsService.getSlots(court.id, date);

  return (
    <section className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5">
      <h3 className="mb-4 font-bold">{court.name} — {MOCK_V2V3_LABELS.courtSchedule}</h3>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {slots.map((slot) => (
          <div
            key={slot.id}
            className={`rounded-xl border p-3 text-sm ${
              slot.status === 'free'
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-[var(--fn-border)] bg-[var(--fn-surface-muted)] opacity-70'
            }`}
          >
            <p className="font-semibold">{slot.startTime}–{slot.endTime}</p>
            <p className="text-xs text-[var(--fn-text-muted)]">
              {slot.status === 'free' ? 'Libre' : 'Ocupado'} · {slot.isPeak ? 'Pico' : 'Valle'}
            </p>
            <p className="mt-1 text-xs font-medium">{formatMoneyFromCents(slot.priceCents, DEFAULT_CURRENCY)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CourtBookingFlow({
  userId,
  institutionId,
  isMember = false,
}: {
  userId: string;
  institutionId: string;
  isMember?: boolean;
}) {
  const { showNotice } = useNoticeModal();
  const courts = mockCourtsService.listCourts(institutionId);
  const [courtId, setCourtId] = useState(courts[0]?.id ?? '');
  const [recurring, setRecurring] = useState(false);
  const court = courts.find((c) => c.id === courtId);
  const date = new Date().toISOString().slice(0, 10);
  const slots = court ? mockCourtsService.getSlots(court.id, date) : [];
  const freeSlots = slots.filter((s) => s.status === 'free');

  const book = (slot: MockCourtSlot) => {
    if (!court) return;
    mockCourtsService.bookSlot(userId, court, slot, { recurring, memberRate: isMember });
    showNotice({
      title: ALERT_LABELS.savedTitle,
      message: MOCK_V2V3_LABELS.courtBookingConfirmed,
      variant: 'success',
    });
  };

  if (!courts.length) {
    return <p className="text-[var(--fn-text-muted)]">No hay canchas disponibles (demostración).</p>;
  }

  return (
    <div className="space-y-6">
      <Select
        label="Cancha"
        value={courtId}
        onChange={setCourtId}
        options={courts.map((c) => ({ value: c.id, label: c.name }))}
      />
      {court ? (
        <>
          <p className="text-sm text-[var(--fn-text-muted)]">
            <MapPin size={14} className="mr-1 inline" />
            {MOCK_V2V3_LABELS.courtCancelPolicy.replace('{hours}', String(court.cancelHours))}
          </p>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
            {MOCK_V2V3_LABELS.courtRecurringShift}
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            {freeSlots.map((slot) => (
              <div key={slot.id} className="rounded-xl border border-[var(--fn-border)] p-4">
                <p className="font-semibold">{slot.startTime}–{slot.endTime}</p>
                <p className="text-sm text-[var(--fn-text-muted)]">
                  {formatMoneyFromCents(isMember ? court.memberPriceCents : slot.priceCents, DEFAULT_CURRENCY)}
                </p>
                <Button
                  title={MOCK_V2V3_LABELS.courtBookShift}
                  size="sm"
                  className="mt-3"
                  onClick={() => book(slot)}
                />
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function CourtBookingsList({ userId }: { userId: string }) {
  const bookings = mockCourtsService.listBookingsForUser(userId);
  if (!bookings.length) {
    return <p className="text-[var(--fn-text-muted)]">No tenés reservas de cancha.</p>;
  }
  return (
    <ul className="space-y-3">
      {bookings.map((b) => (
        <li key={b.id} className="rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4">
          <p className="font-semibold">{b.courtName}</p>
          <p className="text-sm text-[var(--fn-text-muted)]">
            {b.date} · {b.startTime}–{b.endTime}
            {b.recurring ? ' · Turno fijo' : ''}
          </p>
          <p className="mt-1 text-sm font-medium">{formatMoneyFromCents(b.priceCents, DEFAULT_CURRENCY)}</p>
        </li>
      ))}
    </ul>
  );
}

export function InstitutionCourtReservations({ institutionId }: { institutionId: string }) {
  const bookings = mockCourtsService.listBookingsForInstitution(institutionId);
  if (!bookings.length) {
    return (
      <p className="flex items-center gap-2 text-[var(--fn-text-muted)]">
        <Users size={16} /> Sin reservas de cancha hoy.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {bookings.map((b) => (
        <li key={b.id} className="rounded-lg border border-[var(--fn-border)] px-4 py-3 text-sm">
          <span className="font-semibold">{b.courtName}</span>
          <span className="text-[var(--fn-text-muted)]"> — {b.date} {b.startTime}</span>
        </li>
      ))}
    </ul>
  );
}
