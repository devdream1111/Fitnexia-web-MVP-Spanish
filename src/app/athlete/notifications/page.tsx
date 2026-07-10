'use client';

import { PageHeader } from '@/components/layout/page-header';
import { NotificationList } from '@/components/mvp/notification-list';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/contexts/notifications-context';
import { NOTIFICATIONS_LABELS, SCREEN_TITLES, GENERAL_LABELS } from '@/constants/labels';
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
    <div className="mx-auto max-w-3xl space-y-6 pb-4">
      <PageHeader
        variant="premium"
        title={SCREEN_TITLES.notifications}
        eyebrow={GENERAL_LABELS.athleteNotificationsEyebrow}
        subtitle={GENERAL_LABELS.athleteNotificationsSubtitle}
        showBack
        backHref="/athlete/profile"
      />
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
        <p className="rounded-3xl border border-dashed border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/30 px-6 py-10 text-center text-sm text-[var(--fn-text-muted)]">
          {NOTIFICATIONS_LABELS.noNotificationsYet}
        </p>
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
