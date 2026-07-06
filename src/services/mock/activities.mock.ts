import { readMockJson, updateMockJson } from '@/services/mock/storage';

export interface MockActivity {
  id: string;
  institutionId: string;
  title: string;
  type: 'workshop' | 'event' | 'class';
  capacity: number;
  enrolled: number;
  waitlist: number;
  startAt: string;
  priceCents: number;
}

function seed(institutionId: string): MockActivity[] {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return [
    {
      id: 'mock-act-1',
      institutionId,
      title: 'Taller de movilidad',
      type: 'workshop',
      capacity: 20,
      enrolled: 16,
      waitlist: 3,
      startAt: d.toISOString(),
      priceCents: 150000,
    },
    {
      id: 'mock-act-2',
      institutionId,
      title: 'Maratón indoor',
      type: 'event',
      capacity: 50,
      enrolled: 42,
      waitlist: 0,
      startAt: new Date(d.getTime() + 86400000 * 14).toISOString(),
      priceCents: 0,
    },
  ];
}

const KEY = 'activities';

export const mockActivitiesService = {
  list(institutionId: string): MockActivity[] {
    return readMockJson(`${KEY}_${institutionId}`, () => seed(institutionId));
  },

  add(institutionId: string, activity: Omit<MockActivity, 'id' | 'institutionId' | 'enrolled' | 'waitlist'>): MockActivity {
    const entry: MockActivity = {
      ...activity,
      id: `mock-act-${Date.now()}`,
      institutionId,
      enrolled: 0,
      waitlist: 0,
    };
    updateMockJson(`${KEY}_${institutionId}`, () => seed(institutionId), (prev) => [...prev, entry]);
    return entry;
  },
};
