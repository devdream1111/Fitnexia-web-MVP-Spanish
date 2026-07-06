import { readMockJson, updateMockJson } from '@/services/mock/storage';

export interface MockStaffAssignment {
  id: string;
  instructorName: string;
  classTitle: string;
  weekday: number;
  startTime: string;
  endTime: string;
}

function seed(): MockStaffAssignment[] {
  return [
    {
      id: 'mock-sa-1',
      instructorName: 'Ana García',
      classTitle: 'Spinning',
      weekday: 1,
      startTime: '09:00',
      endTime: '10:00',
    },
    {
      id: 'mock-sa-2',
      instructorName: 'Carlos Pérez',
      classTitle: 'CrossFit',
      weekday: 3,
      startTime: '18:30',
      endTime: '19:30',
    },
    {
      id: 'mock-sa-3',
      instructorName: 'Ana García',
      classTitle: 'Yoga',
      weekday: 5,
      startTime: '08:00',
      endTime: '09:00',
    },
  ];
}

const KEY = 'staff_schedules';

export const mockStaffSchedulesService = {
  list(institutionId: string): MockStaffAssignment[] {
    return readMockJson(`${KEY}_${institutionId}`, seed);
  },

  add(institutionId: string, row: Omit<MockStaffAssignment, 'id'>): MockStaffAssignment {
    const entry: MockStaffAssignment = { ...row, id: `mock-sa-${Date.now()}` };
    updateMockJson(`${KEY}_${institutionId}`, seed, (prev) => [...prev, entry]);
    return entry;
  },
};
