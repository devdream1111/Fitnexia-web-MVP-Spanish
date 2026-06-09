'use client';

import {
  useAuth,
  DEFAULT_ADMIN_NOTIFICATIONS,
  type AdminNotificationPreferences,
} from '@/contexts/auth-context';
import { ADMIN_LABELS, ALERT_LABELS, BUTTON_LABELS } from '@/constants/labels';
import { Button } from '@/components/ui/button';
import { ToggleButton } from '@/components/ui/toggle-button';

const PREFS: { key: keyof AdminNotificationPreferences; label: string }[] = [
  {
    key: 'verificationRequests',
    label: ADMIN_LABELS.notifications.preferences.verificationRequests,
  },
  {
    key: 'reportedReviews',
    label: ADMIN_LABELS.notifications.preferences.reportedReviews,
  },
  {
    key: 'platformMetrics',
    label: ADMIN_LABELS.notifications.preferences.platformMetrics,
  },
  {
    key: 'newUserSignups',
    label: ADMIN_LABELS.notifications.preferences.newUserSignups,
  },
  {
    key: 'paymentAlerts',
    label: ADMIN_LABELS.notifications.preferences.paymentAlerts,
  },
  {
    key: 'securityAlerts',
    label: ADMIN_LABELS.notifications.preferences.securityAlerts,
  },
];

export function AdminNotificationsForm() {
  const { user, updateProfile } = useAuth();
  const prefs = user?.adminNotificationPreferences ?? DEFAULT_ADMIN_NOTIFICATIONS;

  const toggle = (key: keyof AdminNotificationPreferences) => {
    updateProfile({
      adminNotificationPreferences: { [key]: !prefs[key] },
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--fn-text-muted)]">{ADMIN_LABELS.notifications.subtitle}</p>
      <div className="space-y-3 rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6">
        {PREFS.map((p) => (
          <ToggleButton
            key={p.key}
            label={p.label}
            checked={prefs[p.key]}
            onChange={() => toggle(p.key)}
          />
        ))}
      </div>
      <Button
        title={BUTTON_LABELS.save}
        onClick={() => alert(`${ALERT_LABELS.savedTitle}: ${ADMIN_LABELS.profile.preferencesSaved}`)}
      />
    </div>
  );
}
