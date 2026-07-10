'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { useNotifications } from '@/contexts/notifications-context';
import type { Notification } from '@/types/api';
import { getNotificationHref } from '@/utils/notification-navigation';

export function useNotificationNavigation() {
  const router = useRouter();
  const { user } = useAuth();
  const { markNotificationAsRead } = useNotifications();

  return useCallback(
    (notification: Notification) => {
      void markNotificationAsRead(notification.id);
      const href = getNotificationHref(notification, user?.role);
      if (href) router.push(href);
    },
    [markNotificationAsRead, router, user?.role],
  );
}
