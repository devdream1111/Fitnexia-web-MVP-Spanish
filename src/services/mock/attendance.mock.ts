import { readMockJson, updateMockJson } from '@/services/mock/storage';

export interface MockAttendanceRow {
  bookingId: string;
  athleteName: string;
  classTitle: string;
  classDate: string;
  present: boolean | null;
}

function seed(): MockAttendanceRow[] {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return [
    {
      bookingId: 'mock-att-1',
      athleteName: 'Sofía R.',
      classTitle: 'Functional HIIT',
      classDate: d.toISOString(),
      present: null,
    },
    {
      bookingId: 'mock-att-2',
      athleteName: 'Martín V.',
      classTitle: 'Functional HIIT',
      classDate: d.toISOString(),
      present: null,
    },
    {
      bookingId: 'mock-att-3',
      athleteName: 'Camila T.',
      classTitle: 'Yoga flow',
      classDate: d.toISOString(),
      present: true,
    },
  ];
}

const KEY = 'attendance';

export const mockAttendanceService = {
  list(institutionId: string): MockAttendanceRow[] {
    return readMockJson(`${KEY}_${institutionId}`, seed);
  },

  setPresent(institutionId: string, bookingId: string, present: boolean): void {
    updateMockJson(`${KEY}_${institutionId}`, seed, (rows) =>
      rows.map((r) => (r.bookingId === bookingId ? { ...r, present } : r)),
    );
  },
};
