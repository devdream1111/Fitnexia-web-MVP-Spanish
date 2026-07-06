import { readMockJson, writeMockJson } from '@/services/mock/storage';
import { seedWeeklySchedule, type MockWeeklyScheduleDay } from '@/services/mock/seed';

const STORAGE_KEY = 'weekly_schedule';

export const mockAvailabilityService = {
  getSchedule(instructorId: string): MockWeeklyScheduleDay[] {
    const all = readMockJson<Record<string, MockWeeklyScheduleDay[]>>(STORAGE_KEY, () => ({}));
    if (!all[instructorId]) {
      all[instructorId] = seedWeeklySchedule();
      writeMockJson(STORAGE_KEY, all);
    }
    return all[instructorId] ?? seedWeeklySchedule();
  },

  saveSchedule(instructorId: string, schedule: MockWeeklyScheduleDay[]): MockWeeklyScheduleDay[] {
    const all = readMockJson<Record<string, MockWeeklyScheduleDay[]>>(STORAGE_KEY, () => ({}));
    all[instructorId] = schedule;
    writeMockJson(STORAGE_KEY, all);
    return schedule;
  },
};

export type { MockWeeklyScheduleDay };
