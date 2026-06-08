'use client';

import { useAuth, DEFAULT_NOTIFICATIONS } from '@/contexts/auth-context';
import { isNotificationPrefVisible } from '@/constants/features';
import { Button } from '@/components/ui/button';
import { ToggleButton } from '@/components/ui/toggle-button';
import { BUTTON_LABELS, NOTIFICATIONS_LABELS } from '@/constants/labels';

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
      <Button title={BUTTON_LABELS.save} className="mt-4" onClick={() => alert('Preferencias guardadas (simulado)')} />
    </div>
  );
}
