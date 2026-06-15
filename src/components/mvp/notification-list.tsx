'use client';

import { NotificationInboxEmpty } from '@/components/mvp/notification-inbox';
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
  if (notifications.length === 0) {
    return <NotificationInboxEmpty preferencesHref={preferencesHref} />;
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <button
          key={notification.id}
          type="button"
          onClick={() => onMarkRead(notification.id)}
          className={`w-full rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5 text-left transition hover:border-[var(--fn-primary)]/30 hover:shadow-md ${
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
            </div>
            {!notification.read ? (
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--fn-primary)]" />
            ) : null}
          </div>
        </button>
      ))}
    </div>
  );
}
