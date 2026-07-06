import { readMockJson, writeMockJson } from '@/services/mock/storage';
import { seedAnalytics, type MockAnalyticsSnapshot } from '@/services/mock/seed';

const STORAGE_KEY = 'analytics';

export const mockAnalyticsService = {
  getSnapshot(): MockAnalyticsSnapshot {
    return readMockJson(STORAGE_KEY, seedAnalytics);
  },

  refresh(): MockAnalyticsSnapshot {
    const snapshot = seedAnalytics();
    writeMockJson(STORAGE_KEY, snapshot);
    return snapshot;
  },
};

export type { MockAnalyticsSnapshot };
