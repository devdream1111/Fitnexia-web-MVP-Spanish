'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useAuth } from './auth-context';

import type { Notification } from '@/types/api';
import {
  addNotification as addNotificationMock,
  getNotificationsForUser as getNotificationsForUserMock,
  markNotificationAsRead as markNotificationAsReadMock,
  MOCK_NOTIFICATIONS_BY_USER,
} from '@/data/mock';

interface NotificationsContextValue {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => Notification;
  getNotificationsForUser: (userId: string) => Notification[];
  markNotificationAsRead: (notificationId: string) => void;
  unreadCount: number;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notificationsByUser, setNotificationsByUser] = useState<Record<string, Notification[]>>(MOCK_NOTIFICATIONS_BY_USER);

  const notifications = user ? notificationsByUser[user.id] || [] : [];
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'createdAt'>) => {
      if (!user) throw new Error('No user logged in');
      const newNotification = addNotificationMock(user.id, notification);
      setNotificationsByUser(prev => ({
        ...prev,
        [user.id]: [...(prev[user.id] || []), newNotification],
      }));
      return newNotification;
    },
    [user]
  );

  const getNotificationsForUser = useCallback(
    (userId: string) => (notificationsByUser[userId] || []).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    [notificationsByUser]
  );

  const markNotificationAsRead = useCallback(
    (notificationId: string) => {
      if (!user) return;
      markNotificationAsReadMock(user.id, notificationId);
      setNotificationsByUser(prev => ({
        ...prev,
        [user.id]: prev[user.id]?.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
      }));
    },
    [user]
  );

  const value = useMemo(
    () => ({
      notifications,
      addNotification,
      getNotificationsForUser,
      markNotificationAsRead,
      unreadCount,
    }),
    [
      notifications,
      addNotification,
      getNotificationsForUser,
      markNotificationAsRead,
      unreadCount,
    ]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
