'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { useFeature } from '@/hooks/use-feature';
import {
  apiGetInstructorInvites,
  apiGetNotifications,
  apiMarkAllNotificationsRead,
  apiMarkNotificationRead,
  type InstructorGymInvite,
} from '@/services/api';
import { GYM_LABELS } from '@/constants/labels';
import type { Notification } from '@/types/api';

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  inboxLoading: boolean;
  instructorInvites: InstructorGymInvite[];
  refreshInstructorInvites: () => Promise<void>;
  refreshInbox: () => Promise<void>;
  acceptInstructorInvite: (inviteId: string) => Promise<{ institutionId: string; institutionName: string }>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => Notification;
  getNotificationsForUser: (userId: string) => Notification[];
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

const READ_INVITES_KEY = 'fitnexia_read_invite_ids';

function loadReadInviteIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(READ_INVITES_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveReadInviteIds(ids: Set<string>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(READ_INVITES_KEY, JSON.stringify(Array.from(ids)));
}

function isInviteNotification(id: string, invites: InstructorGymInvite[]) {
  return invites.some((i) => i.id === id);
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const inboxEnabled = useFeature('inAppNotificationCenter');
  const [instructorInvites, setInstructorInvites] = useState<InstructorGymInvite[]>([]);
  const [readInviteIds, setReadInviteIds] = useState<Set<string>>(() => new Set());
  const [inboxNotifications, setInboxNotifications] = useState<Notification[]>([]);
  const [inboxLoading, setInboxLoading] = useState(false);

  useEffect(() => {
    setReadInviteIds(loadReadInviteIds());
  }, []);

  const refreshInstructorInvites = useCallback(async () => {
    if (user?.role !== 'instructor') {
      setInstructorInvites([]);
      return;
    }
    const { data } = await apiGetInstructorInvites();
    setInstructorInvites(data.filter((i) => i.status === 'pending'));
  }, [user?.role]);

  useEffect(() => {
    refreshInstructorInvites();
  }, [refreshInstructorInvites]);

  const refreshInbox = useCallback(async () => {
    if (!user?.id || !inboxEnabled) {
      setInboxNotifications([]);
      return;
    }
    setInboxLoading(true);
    try {
      const { data } = await apiGetNotifications({ limit: 50 });
      setInboxNotifications(
        data.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          body: n.body,
          read: n.read,
          createdAt: n.createdAt,
          data: n.data,
        })),
      );
    } catch {
      setInboxNotifications([]);
    } finally {
      setInboxLoading(false);
    }
  }, [inboxEnabled, user?.id]);

  useEffect(() => {
    refreshInbox();
  }, [refreshInbox]);

  const acceptInstructorInvite = useCallback(async (inviteId: string) => {
    const { apiAcceptInstructorInvite } = await import('@/services/api');
    const result = await apiAcceptInstructorInvite(inviteId);
    setInstructorInvites((prev) => prev.filter((i) => i.id !== inviteId));
    return result;
  }, []);

  const notifications: Notification[] = useMemo(() => {
    const items: Notification[] = [];

    if (user?.role === 'instructor') {
      items.push(
        ...instructorInvites.map((inv) => ({
          id: inv.id,
          type: 'gym_invite',
          title: GYM_LABELS.instructors.inviteFromGym,
          body: inv.message?.trim() || GYM_LABELS.instructors.inviteBody(inv.institutionName),
          read: readInviteIds.has(inv.id),
          createdAt: inv.sentAt,
        })),
      );
    }

    if (inboxEnabled) {
      items.push(...inboxNotifications);
    }

    return items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [user?.role, instructorInvites, readInviteIds, inboxEnabled, inboxNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const markNotificationAsRead = useCallback(
    async (notificationId: string) => {
      if (isInviteNotification(notificationId, instructorInvites)) {
        setReadInviteIds((prev) => {
          const next = new Set(prev);
          next.add(notificationId);
          saveReadInviteIds(next);
          return next;
        });
        return;
      }

      setInboxNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );

      if (inboxEnabled) {
        try {
          await apiMarkNotificationRead(notificationId);
        } catch {
          // Optimistic UI — ignore transient failures
        }
      }
    },
    [inboxEnabled, instructorInvites],
  );

  const markAllNotificationsAsRead = useCallback(async () => {
    setInboxNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setReadInviteIds((prev) => {
      const next = new Set(prev);
      instructorInvites.forEach((i) => next.add(i.id));
      saveReadInviteIds(next);
      return next;
    });

    if (inboxEnabled) {
      try {
        await apiMarkAllNotificationsRead();
      } catch {
        // ignore
      }
    }
  }, [inboxEnabled, instructorInvites]);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'createdAt'>) => ({
      ...notification,
      id: `local-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }),
    [],
  );

  const getNotificationsForUser = useCallback((_userId: string) => [] as Notification[], []);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      inboxLoading,
      instructorInvites,
      refreshInstructorInvites,
      refreshInbox,
      acceptInstructorInvite,
      addNotification,
      getNotificationsForUser,
      markNotificationAsRead,
      markAllNotificationsAsRead,
    }),
    [
      notifications,
      unreadCount,
      inboxLoading,
      instructorInvites,
      refreshInstructorInvites,
      refreshInbox,
      acceptInstructorInvite,
      addNotification,
      getNotificationsForUser,
      markNotificationAsRead,
      markAllNotificationsAsRead,
    ],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
