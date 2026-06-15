'use client';

import { PageHeader } from '@/components/layout/page-header';
import { useNotifications } from '@/contexts/notifications-context';
import { SCREEN_TITLES, NOTIFICATIONS_LABELS } from '@/constants/labels';
import { Badge } from '@/components/ui/badge';

export default function AdminNotificationsPage() {
  const { notifications, markNotificationAsRead } = useNotifications();

  return (
    <div className="space-y-6">
      <PageHeader title={SCREEN_TITLES.notifications} showBack />
      <div className="overflow-hidden rounded-xl bg-[var(--fn-surface)]">
        {notifications.length === 0 ? (
          <p className="p-12 text-center text-[var(--fn-text-muted)]">
            {NOTIFICATIONS_LABELS.noNotificationsYet}
          </p>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => markNotificationAsRead(n.id)}
              className={`w-full border-b border-[var(--fn-border)] p-4 text-left last:border-b-0 hover:bg-[var(--fn-surface-muted)] ${
                !n.read ? 'bg-[var(--fn-primary-muted)]/30' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-[var(--fn-text)]">{n.title}</p>
                  <p className="mt-1 text-sm text-[var(--fn-text-muted)]">{n.body}</p>
                </div>
                {!n.read && <Badge label="Nueva" variant="warning" size="sm" />}
              </div>
              <p className="mt-2 text-xs text-[var(--fn-text-muted)]">
                {new Date(n.createdAt).toLocaleString('es-UY')}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
