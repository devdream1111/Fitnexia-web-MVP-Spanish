import { readMockJson, writeMockJson } from '@/services/mock/storage';
import { seedRecordedClasses, type MockRecordedClass } from '@/services/mock/seed';

const STORAGE_KEY = 'recorded_classes';

export const mockRecordedClassesService = {
  list(): MockRecordedClass[] {
    return readMockJson(STORAGE_KEY, seedRecordedClasses);
  },

  updateProgress(id: string, watchProgressPct: number): MockRecordedClass[] {
    const list = mockRecordedClassesService.list().map((item) =>
      item.id === id ? { ...item, watchProgressPct: Math.min(100, Math.max(0, watchProgressPct)) } : item,
    );
    writeMockJson(STORAGE_KEY, list);
    return list;
  },
};

export type { MockRecordedClass };
