'use client';

import { PageHeader } from '@/components/layout/page-header';
import { NotificationList } from '@/components/mvp/notification-list';
import { useNotifications } from '@/contexts/notifications-context';
import { SCREEN_TITLES } from '@/constants/labels';

export default function GymNotificationsPage() {
  const { notifications, markNotificationAsRead } = useNotifications();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title={SCREEN_TITLES.notifications} showBack />
      <NotificationList
        notifications={notifications}
        preferencesHref="/gym/profile/notifications"
        onMarkRead={markNotificationAsRead}
      />
    </div>
  );
}
