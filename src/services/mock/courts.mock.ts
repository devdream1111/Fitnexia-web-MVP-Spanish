import { readMockJson, updateMockJson } from '@/services/mock/storage';

export type CourtType = 'padel' | 'tennis' | 'football_5' | 'football_7' | 'football_11' | 'rugby';

export interface MockCourt {
  id: string;
  institutionId: string;
  name: string;
  type: CourtType;
  surface: string;
  indoor: boolean;
  hasLighting: boolean;
  openTime: string;
  closeTime: string;
  shiftMinutes: number;
  peakPriceCents: number;
  offPeakPriceCents: number;
  memberPriceCents: number;
  guestPriceCents: number;
  cancelHours: number;
}

export interface MockCourtSlot {
  id: string;
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'free' | 'booked' | 'blocked';
  priceCents: number;
  isPeak: boolean;
}

export interface MockCourtBooking {
  id: string;
  courtId: string;
  courtName: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  priceCents: number;
  status: 'confirmed' | 'cancelled';
  recurring: boolean;
  createdAt: string;
}

function seedCourts(institutionId: string): MockCourt[] {
  return [
    {
      id: 'mock-court-1',
      institutionId,
      name: 'Cancha Pádel 1',
      type: 'padel',
      surface: 'Césped sintético',
      indoor: false,
      hasLighting: true,
      openTime: '08:00',
      closeTime: '23:00',
      shiftMinutes: 90,
      peakPriceCents: 450000,
      offPeakPriceCents: 320000,
      memberPriceCents: 280000,
      guestPriceCents: 450000,
      cancelHours: 24,
    },
    {
      id: 'mock-court-2',
      institutionId,
      name: 'Fútbol 5 — Principal',
      type: 'football_5',
      surface: 'Césped sintético',
      indoor: true,
      hasLighting: true,
      openTime: '07:00',
      closeTime: '22:00',
      shiftMinutes: 60,
      peakPriceCents: 550000,
      offPeakPriceCents: 380000,
      memberPriceCents: 350000,
      guestPriceCents: 550000,
      cancelHours: 12,
    },
  ];
}

function seedSlots(courts: MockCourt[]): MockCourtSlot[] {
  const today = new Date();
  const date = today.toISOString().slice(0, 10);
  const slots: MockCourtSlot[] = [];
  for (const court of courts) {
    ['10:00', '12:00', '18:00', '20:00'].forEach((start, i) => {
      const [h, m] = start.split(':').map(Number);
      const end = new Date(2000, 0, 1, h, m + court.shiftMinutes);
      slots.push({
        id: `mock-slot-${court.id}-${i}`,
        courtId: court.id,
        date,
        startTime: start,
        endTime: `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`,
        status: i === 2 ? 'booked' : 'free',
        priceCents: i >= 2 ? court.peakPriceCents : court.offPeakPriceCents,
        isPeak: i >= 2,
      });
    });
  }
  return slots;
}

const COURTS_KEY = 'courts';
const SLOTS_KEY = 'court_slots';
const BOOKINGS_KEY = 'court_bookings';

export const mockCourtsService = {
  listCourts(institutionId: string): MockCourt[] {
    const all = readMockJson<Record<string, MockCourt[]>>(COURTS_KEY, () => ({}));
    if (!all[institutionId]) {
      all[institutionId] = seedCourts(institutionId);
    }
    return all[institutionId];
  },

  addCourt(institutionId: string, court: Omit<MockCourt, 'id' | 'institutionId'>): MockCourt {
    return updateMockJson<Record<string, MockCourt[]>>(COURTS_KEY, () => ({}), (all) => {
      const list = all[institutionId] ?? seedCourts(institutionId);
      const entry: MockCourt = {
        ...court,
        id: `mock-court-${Date.now()}`,
        institutionId,
      };
      return { ...all, [institutionId]: [...list, entry] };
    })[institutionId].at(-1)!;
  },

  getSlots(courtId: string, date: string): MockCourtSlot[] {
    const slots = readMockJson<MockCourtSlot[]>(SLOTS_KEY, () => []);
    const existing = slots.filter((s) => s.courtId === courtId && s.date === date);
    if (existing.length > 0) return existing;
    const court = Object.values(readMockJson<Record<string, MockCourt[]>>(COURTS_KEY, () => ({})))
      .flat()
      .find((c) => c.id === courtId);
    if (!court) return [];
    const seeded = seedSlots([court]).map((s) => ({ ...s, date }));
    updateMockJson<MockCourtSlot[]>(SLOTS_KEY, () => [], (prev) => [...prev, ...seeded]);
    return seeded;
  },

  bookSlot(
    userId: string,
    court: MockCourt,
    slot: MockCourtSlot,
    opts?: { recurring?: boolean; memberRate?: boolean },
  ): MockCourtBooking {
    const price = opts?.memberRate ? court.memberPriceCents : slot.priceCents;
    const booking: MockCourtBooking = {
      id: `mock-cb-${Date.now()}`,
      courtId: court.id,
      courtName: court.name,
      userId,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      priceCents: price,
      status: 'confirmed',
      recurring: opts?.recurring ?? false,
      createdAt: new Date().toISOString(),
    };
    updateMockJson<MockCourtBooking[]>(BOOKINGS_KEY, () => [], (prev) => [...prev, booking]);
    updateMockJson<MockCourtSlot[]>(SLOTS_KEY, () => [], (prev) =>
      prev.map((s) => (s.id === slot.id ? { ...s, status: 'booked' as const } : s)),
    );
    return booking;
  },

  listBookingsForUser(userId: string): MockCourtBooking[] {
    return readMockJson<MockCourtBooking[]>(BOOKINGS_KEY, () => []).filter(
      (b) => b.userId === userId && b.status === 'confirmed',
    );
  },

  listBookingsForInstitution(institutionId: string): MockCourtBooking[] {
    const courts = this.listCourts(institutionId);
    const courtIds = new Set(courts.map((c) => c.id));
    return readMockJson<MockCourtBooking[]>(BOOKINGS_KEY, () => []).filter(
      (b) => courtIds.has(b.courtId) && b.status === 'confirmed',
    );
  },

  cancelBooking(bookingId: string, userId: string): boolean {
    let ok = false;
    updateMockJson<MockCourtBooking[]>(BOOKINGS_KEY, () => [], (prev) =>
      prev.map((b) => {
        if (b.id === bookingId && b.userId === userId) {
          ok = true;
          return { ...b, status: 'cancelled' as const };
        }
        return b;
      }),
    );
    return ok;
  },
};
