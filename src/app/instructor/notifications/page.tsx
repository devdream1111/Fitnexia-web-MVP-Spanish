'use client';

import { useMemo, useState } from 'react';
import { Building2, CheckCircle2 } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { NotificationInboxEmpty } from '@/components/mvp/notification-inbox';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import { useNotifications } from '@/contexts/notifications-context';
import { ALERT_LABELS, GYM_LABELS, SCREEN_TITLES } from '@/constants/labels';
import { ApiClientError } from '@/services/api-client';

export default function InstructorNotificationsPage() {
  const { refreshUser } = useAuth();
  const {
    notifications,
    instructorInvites,
    markNotificationAsRead,
    acceptInstructorInvite,
    refreshInstructorInvites,
  } = useNotifications();
  const { showNotice } = useNoticeModal();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const inviteIds = useMemo(() => new Set(instructorInvites.map((i) => i.id)), [instructorInvites]);
  const otherNotifications = useMemo(
    () => notifications.filter((n) => !inviteIds.has(n.id)),
    [notifications, inviteIds],
  );

  const handleAccept = async (inviteId: string) => {
    setAcceptingId(inviteId);
    try {
      const result = await acceptInstructorInvite(inviteId);
      markNotificationAsRead(inviteId);
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: `${GYM_LABELS.instructors.inviteAccepted} ${result.institutionName}.`,
        variant: 'success',
      });
      await refreshInstructorInvites();
      await refreshUser();
    } catch (error) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: error instanceof ApiClientError ? error.message : 'No se pudo aceptar la invitación',
        variant: 'error',
      });
    } finally {
      setAcceptingId(null);
    }
  };

  const isEmpty = instructorInvites.length === 0 && otherNotifications.length === 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title={SCREEN_TITLES.notifications} showBack />

      {isEmpty ? (
        <NotificationInboxEmpty
          preferencesHref="/instructor/profile/notifications"
          hint="Las invitaciones de gimnasios y alertas de reservas aparecerán aquí."
        />
      ) : (
        <>
          {instructorInvites.length > 0 ? (
            <ul className="space-y-4">
              {instructorInvites.map((invite) => {
                const notification = notifications.find((n) => n.id === invite.id);
                const unread = notification ? !notification.read : true;

                return (
                  <li
                    key={invite.id}
                    className={[
                      'overflow-hidden rounded-2xl border bg-[var(--fn-surface)] transition',
                      unread
                        ? 'border-[var(--fn-primary)]/50 shadow-[0_0_0_1px_var(--fn-primary-muted)]'
                        : 'border-[var(--fn-border)]',
                    ].join(' ')}
                  >
                    <div className="relative bg-gradient-to-r from-violet-600/10 via-[var(--fn-primary-muted)]/30 to-transparent px-5 py-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]">
                          <Building2 size={22} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-extrabold text-[var(--fn-text)]">{invite.institutionName}</p>
                          <p className="mt-1 text-sm leading-relaxed text-[var(--fn-text-muted)]">
                            {invite.message?.trim() ||
                              GYM_LABELS.instructors.inviteBody(invite.institutionName)}
                          </p>
                          <p className="mt-2 text-xs text-[var(--fn-text-muted)]">
                            {new Date(invite.sentAt).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        {unread ? (
                          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--fn-primary)]" />
                        ) : (
                          <CheckCircle2 size={18} className="shrink-0 text-[var(--fn-success)]" />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 border-t border-[var(--fn-border)] px-5 py-4">
                      <Button
                        title={GYM_LABELS.instructors.acceptInvite}
                        loading={acceptingId === invite.id}
                        onClick={() => handleAccept(invite.id)}
                      />
                      <Button
                        title="Marcar como leída"
                        variant="ghost"
                        size="sm"
                        onClick={() => markNotificationAsRead(invite.id)}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {otherNotifications.length > 0 ? (
            <div className="space-y-3">
              {otherNotifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => markNotificationAsRead(notification.id)}
                  className={`w-full rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5 text-left transition hover:shadow-md ${
                    !notification.read ? 'border-l-4 border-l-[var(--fn-primary)]' : ''
                  }`}
                >
                  <p className="font-bold">{notification.title}</p>
                  <p className="mt-1 text-sm text-[var(--fn-text-muted)]">{notification.body}</p>
                </button>
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
