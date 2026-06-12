'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { apiGetInstructorInvites, type InstructorGymInvite } from '@/services/api';
import { GYM_LABELS } from '@/constants/labels';
import type { Notification } from '@/types/api';

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  instructorInvites: InstructorGymInvite[];
  refreshInstructorInvites: () => Promise<void>;
  acceptInstructorInvite: (inviteId: string) => Promise<{ institutionId: string; institutionName: string }>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => Notification;
  getNotificationsForUser: (userId: string) => Notification[];
  markNotificationAsRead: (notificationId: string) => void;
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

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [instructorInvites, setInstructorInvites] = useState<InstructorGymInvite[]>([]);
  const [readInviteIds, setReadInviteIds] = useState<Set<string>>(() => new Set());

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

  const acceptInstructorInvite = useCallback(
    async (inviteId: string) => {
      const { apiAcceptInstructorInvite } = await import('@/services/api');
      const result = await apiAcceptInstructorInvite(inviteId);
      setInstructorInvites((prev) => prev.filter((i) => i.id !== inviteId));
      return result;
    },
    [],
  );

  const notifications: Notification[] = useMemo(() => {
    if (user?.role === 'instructor') {
      return instructorInvites.map((inv) => ({
        id: inv.id,
        type: 'gym_invite',
        title: GYM_LABELS.instructors.inviteFromGym,
        body: inv.message?.trim() || GYM_LABELS.instructors.inviteBody(inv.institutionName),
        read: readInviteIds.has(inv.id),
        createdAt: inv.sentAt,
      }));
    }
    return [];
  }, [user?.role, instructorInvites, readInviteIds]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setReadInviteIds((prev) => {
      const next = new Set(prev);
      next.add(notificationId);
      saveReadInviteIds(next);
      return next;
    });
  }, []);

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
      instructorInvites,
      refreshInstructorInvites,
      acceptInstructorInvite,
      addNotification,
      getNotificationsForUser,
      markNotificationAsRead,
    }),
    [
      notifications,
      unreadCount,
      instructorInvites,
      refreshInstructorInvites,
      acceptInstructorInvite,
      addNotification,
      getNotificationsForUser,
      markNotificationAsRead,
    ],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
