import type { Notification } from '@/types/api';

import { readMockJson, updateMockJson, writeMockJson } from '@/services/mock/storage';
import { seedNotifications } from '@/services/mock/seed';

const STORAGE_KEY = 'notifications';

function seedForUser(userId: string, role: string): Notification[] {
  return seedNotifications(userId, role);
}

export const mockNotificationsService = {
  list(userId: string, role: string): Notification[] {
    const all = readMockJson<Record<string, Notification[]>>(STORAGE_KEY, () => ({}));
    if (!all[userId]) {
      all[userId] = seedForUser(userId, role);
      writeMockJson(STORAGE_KEY, all);
    }
    return all[userId] ?? [];
  },

  markRead(userId: string, notificationId: string): void {
    updateMockJson<Record<string, Notification[]>>(STORAGE_KEY, () => ({}), (all) => {
      const list = all[userId];
      if (!list) return all;
      return {
        ...all,
        [userId]: list.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      };
    });
  },
};

/** Replace with apiListNotifications / apiMarkNotificationRead when backend ships. */
export function listMockNotifications(userId: string, role: string) {
  return mockNotificationsService.list(userId, role);
}

export function markMockNotificationRead(userId: string, notificationId: string) {
  mockNotificationsService.markRead(userId, notificationId);
}
