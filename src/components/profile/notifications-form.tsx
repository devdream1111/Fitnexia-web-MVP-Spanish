'use client';

import { useAuth, DEFAULT_NOTIFICATIONS } from '@/contexts/auth-context';
import { isNotificationPrefVisible } from '@/constants/features';
import { Button } from '@/components/ui/button';
import { BUTTON_LABELS } from '@/constants/labels';

const PREFS: { key: keyof typeof DEFAULT_NOTIFICATIONS; label: string }[] = [
  { key: 'bookingConfirmed', label: 'Booking confirmed' },
  { key: 'classReminders', label: 'Class reminders' },
  { key: 'paymentUpdates', label: 'Payment updates' },
  { key: 'creditsExpiring', label: 'Credits expiring' },
  { key: 'marketing', label: 'Marketing & tips' },
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
    <div className="space-y-2">
      {PREFS.filter((p) => isNotificationPrefVisible(p.key)).map((p) => (
        <label
          key={p.key}
          className="flex cursor-pointer items-center justify-between rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] px-4 py-3">
          <span>{p.label}</span>
          <input type="checkbox" checked={prefs[p.key]} onChange={() => toggle(p.key)} />
        </label>
      ))}
      <Button title={BUTTON_LABELS.save} className="mt-4" onClick={() => alert('Preferences saved (mock)')} />
    </div>
  );
}
