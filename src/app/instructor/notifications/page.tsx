'use client';

import { useMemo } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { useNotifications } from '@/contexts/notifications-context';
import { useAuth } from '@/contexts/auth-context';
import { SCREEN_TITLES, NOTIFICATIONS_LABELS } from '@/constants/labels';

export default function InstructorNotificationsPage() {
  const { notifications, markNotificationAsRead } = useNotifications();
  const { user } = useAuth();

  const handleNotificationClick = (notificationId: string) => {
    markNotificationAsRead(notificationId);
  };

  return (
    <div>
      <PageHeader title={SCREEN_TITLES.notifications} showBack />

      <div className="mt-6">
        {notifications.length === 0 ? (
          <p className="text-[var(--fn-text-muted)]">{NOTIFICATIONS_LABELS.noNotificationsYet}</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`mb-4 rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6 cursor-pointer transition ${
                !notification.read ? 'border-l-4 border-l-[var(--fn-primary)]' : ''
              }`}
              onClick={() => handleNotificationClick(notification.id)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-lg">{notification.title}</p>
                  <p className="text-sm text-[var(--fn-text-muted)] mt-1">{notification.body}</p>
                  <p className="text-xs text-[var(--fn-text-muted)] mt-2">
                    {new Date(notification.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {!notification.read && (
                  <span className="w-3 h-3 rounded-full bg-[var(--fn-primary)]"></span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
