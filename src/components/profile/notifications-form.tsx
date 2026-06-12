'use client';

import { useAuth, DEFAULT_NOTIFICATIONS } from '@/contexts/auth-context';
import { isNotificationPrefVisible } from '@/constants/features';
import { ToggleButton } from '@/components/ui/toggle-button';
import { NOTIFICATIONS_LABELS } from '@/constants/labels';

const PREFS: { key: keyof typeof DEFAULT_NOTIFICATIONS; label: string }[] = [
  { key: 'bookingConfirmed', label: NOTIFICATIONS_LABELS.preferences.bookingConfirmed },
  { key: 'classReminders', label: NOTIFICATIONS_LABELS.preferences.classReminders },
  { key: 'paymentUpdates', label: NOTIFICATIONS_LABELS.preferences.paymentUpdates },
  { key: 'creditsExpiring', label: NOTIFICATIONS_LABELS.preferences.creditsExpiring },
  { key: 'marketing', label: NOTIFICATIONS_LABELS.preferences.marketing },
];

export function NotificationsForm() {
  const { user, updateProfile } = useAuth();
  const prefs = user?.notificationPreferences ?? DEFAULT_NOTIFICATIONS;

  const toggle = (key: keyof typeof DEFAULT_NOTIFICATIONS) => {
    updateProfile({
      notificationPreferences: { [key]: !prefs[key] },
    });
  };

  return (
    <div className="space-y-3">
      {PREFS.filter((p) => isNotificationPrefVisible(p.key)).map((p) => (
        <ToggleButton
          key={p.key}
          label={p.label}
          checked={prefs[p.key]}
          onChange={() => toggle(p.key)}
        />
      ))}
      <p className="mt-4 text-xs text-[var(--fn-text-muted)]">
        Los cambios se guardan automáticamente al activar o desactivar cada opción.
      </p>
    </div>
  );
}
