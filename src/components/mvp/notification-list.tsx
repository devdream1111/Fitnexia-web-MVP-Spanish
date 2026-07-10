'use client';

import { NotificationInboxEmpty } from '@/components/mvp/notification-inbox';
import { useAuth } from '@/contexts/auth-context';
import { useNotificationNavigation } from '@/hooks/use-notification-navigation';
import { getNotificationHref } from '@/utils/notification-navigation';
import type { Notification } from '@/types/api';

export function NotificationList({
  notifications,
  preferencesHref,
  onMarkRead,
}: {
  notifications: Notification[];
  preferencesHref: string;
  onMarkRead: (id: string) => void;
}) {
  const { user } = useAuth();
  const navigateNotification = useNotificationNavigation();

  if (notifications.length === 0) {
    return <NotificationInboxEmpty preferencesHref={preferencesHref} />;
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => {
        const href = getNotificationHref(notification, user?.role);
        const handleClick = () => {
          if (href) {
            navigateNotification(notification);
            return;
          }
          onMarkRead(notification.id);
        };

        return (
          <button
            key={notification.id}
            type="button"
            onClick={handleClick}
            className={`w-full rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-[var(--fn-primary)]/30 hover:shadow-[0_14px_32px_-20px_color-mix(in_srgb,var(--fn-primary)_40%,transparent)] ${
              !notification.read ? 'border-l-4 border-l-[var(--fn-primary)]' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-bold text-[var(--fn-text)]">{notification.title}</p>
                <p className="mt-1 text-sm text-[var(--fn-text-muted)]">{notification.body}</p>
                <p className="mt-2 text-xs text-[var(--fn-text-muted)]">
                  {new Date(notification.createdAt).toLocaleDateString('es-UY', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                {href ? (
                  <p className="mt-2 text-xs font-semibold text-[var(--fn-primary-text)]">
                    Tocá para abrir →
                  </p>
                ) : null}
              </div>
              {!notification.read ? (
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--fn-primary)]" />
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}
