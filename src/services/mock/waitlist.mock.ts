import type { ClassListItem } from '@/types/api';

import { readMockJson, updateMockJson, writeMockJson } from '@/services/mock/storage';
import type { MockWaitlistEntry } from '@/services/mock/seed';

const STORAGE_KEY = 'waitlist';

function seedWaitlist(): MockWaitlistEntry[] {
  return [];
}

export const mockWaitlistService = {
  listForUser(userId: string): MockWaitlistEntry[] {
    return readMockJson(STORAGE_KEY, seedWaitlist).filter((e) => e.userId === userId);
  },

  join(userId: string, cls: ClassListItem): MockWaitlistEntry {
    return updateMockJson(STORAGE_KEY, seedWaitlist, (entries) => {
      const existing = entries.find((e) => e.userId === userId && e.classId === cls.id);
      if (existing) return entries;

      const sameClass = entries.filter((e) => e.classId === cls.id);
      const entry: MockWaitlistEntry = {
        id: `mock-wl-${cls.id}-${userId}`,
        classId: cls.id,
        userId,
        classTitle: cls.title,
        startAt: cls.startAt,
        position: sameClass.length + 1,
        createdAt: new Date().toISOString(),
      };
      return [...entries, entry];
    }).find((e) => e.userId === userId && e.classId === cls.id)!;
  },

  leave(userId: string, entryId: string): void {
    updateMockJson(STORAGE_KEY, seedWaitlist, (entries) => {
      const removed = entries.find((e) => e.id === entryId && e.userId === userId);
      if (!removed) return entries;
      const next = entries.filter((e) => e.id !== entryId);
      return next.map((e) =>
        e.classId === removed.classId && e.position > removed.position
          ? { ...e, position: e.position - 1 }
          : e,
      );
    });
  },
};

/** Replace with apiJoinWaitlist / apiListMyWaitlist when backend ships. */
export function listMyWaitlist(userId: string) {
  return mockWaitlistService.listForUser(userId);
}

export function joinClassWaitlist(userId: string, cls: ClassListItem) {
  return mockWaitlistService.join(userId, cls);
}

export function leaveClassWaitlist(userId: string, entryId: string) {
  mockWaitlistService.leave(userId, entryId);
}
