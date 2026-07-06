'use client';

import { PageHeader } from '@/components/layout/page-header';
import { NotificationList } from '@/components/mvp/notification-list';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/contexts/notifications-context';
import { NOTIFICATIONS_LABELS, SCREEN_TITLES } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';

export default function AthleteNotificationsPage() {
  const inboxEnabled = useFeature('inAppNotificationCenter');
  const {
    notifications,
    inboxLoading,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    unreadCount,
  } = useNotifications();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title={SCREEN_TITLES.notifications} showBack />
      {inboxEnabled && notifications.length > 0 && unreadCount > 0 ? (
        <div className="flex justify-end">
          <Button
            title={NOTIFICATIONS_LABELS.markAllRead}
            variant="outline"
            size="sm"
            onClick={() => markAllNotificationsAsRead()}
          />
        </div>
      ) : null}
      {inboxLoading && notifications.length === 0 ? (
        <p className="text-sm text-[var(--fn-text-muted)]">{NOTIFICATIONS_LABELS.noNotificationsYet}</p>
      ) : (
        <NotificationList
          notifications={notifications}
          preferencesHref="/athlete/profile/notifications"
          onMarkRead={(id) => {
            void markNotificationAsRead(id);
          }}
        />
      )}
    </div>
  );
}
