'use client';

import { useState } from 'react';
import { Bell, CalendarCheck, CreditCard, Megaphone, Users, Wallet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useAuth, DEFAULT_NOTIFICATIONS, getAuthErrorMessage, type NotificationPreferences } from '@/contexts/auth-context';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import { isNotificationPrefVisible } from '@/constants/features';
import { ToggleButton } from '@/components/ui/toggle-button';
import { ALERT_LABELS, NOTIFICATIONS_LABELS } from '@/constants/labels';

type PrefKey = keyof typeof DEFAULT_NOTIFICATIONS;

type PrefItem = {
  key: PrefKey;
  label: string;
  icon: LucideIcon;
  description: string;
};

const ATHLETE_BOOKING_PREFS: PrefItem[] = [
  {
    key: 'bookingConfirmed',
    label: NOTIFICATIONS_LABELS.preferences.bookingConfirmed,
    icon: CalendarCheck,
    description: 'Cuando confirmes o canceles una reserva.',
  },
  {
    key: 'classReminders',
    label: NOTIFICATIONS_LABELS.preferences.classReminders,
    icon: Bell,
    description: 'Recordatorios 24 h y 1 h antes de cada clase.',
  },
  {
    key: 'paymentUpdates',
    label: NOTIFICATIONS_LABELS.preferences.paymentUpdates,
    icon: CreditCard,
    description: 'Confirmaciones y fallos de pago.',
  },
  {
    key: 'creditsExpiring',
    label: NOTIFICATIONS_LABELS.preferences.creditsExpiring,
    icon: Wallet,
    description: 'Avisos antes de que venzan tus créditos.',
  },
  {
    key: 'membershipReminders',
    label: NOTIFICATIONS_LABELS.preferences.membershipReminders,
    icon: Users,
    description: 'Cuotas del club y vencimientos próximos.',
  },
];

const ATHLETE_ACCOUNT_PREFS: PrefItem[] = [
  {
    key: 'marketing',
    label: NOTIFICATIONS_LABELS.preferences.marketing,
    icon: Megaphone,
    description: 'Novedades, promociones y consejos de Fitnexia.',
  },
];

const GYM_PREFS: PrefItem[] = [
  {
    key: 'bookingConfirmed',
    label: NOTIFICATIONS_LABELS.preferences.bookingConfirmed,
    icon: CalendarCheck,
    description: 'Nuevas reservas y cancelaciones en tus clases.',
  },
  {
    key: 'paymentUpdates',
    label: NOTIFICATIONS_LABELS.preferences.paymentUpdates,
    icon: CreditCard,
    description: 'Ingresos, reembolsos y pagos procesados.',
  },
  {
    key: 'memberDelinquencyAlerts',
    label: NOTIFICATIONS_LABELS.preferences.memberDelinquencyAlerts,
    icon: Users,
    description: 'Socios con cuotas vencidas o en mora.',
  },
  {
    key: 'marketing',
    label: NOTIFICATIONS_LABELS.preferences.marketing,
    icon: Megaphone,
    description: 'Actualizaciones del producto y recursos para tu club.',
  },
];

function PreferenceSection({
  title,
  items,
  prefs,
  savingKey,
  onToggle,
}: {
  title: string;
  items: PrefItem[];
  prefs: NotificationPreferences;
  savingKey: PrefKey | null;
  onToggle: (key: PrefKey) => void;
}) {
  const visible = items.filter((p) => isNotificationPrefVisible(p.key));
  if (visible.length === 0) return null;

  return (
    <section className="rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--fn-text-muted)]">
        {title}
      </h3>
      <ul className="space-y-2">
        {visible.map((p) => {
          const Icon = p.icon;
          const isSaving = savingKey === p.key;
          return (
            <li key={p.key}>
              <div
                className={`rounded-lg border border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/30 px-3 py-2.5 transition ${
                  isSaving ? 'opacity-70' : ''
                }`}
              >
                <div className="mb-2 flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]">
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--fn-text)]">{p.label}</p>
                    <p className="mt-0.5 text-xs text-[var(--fn-text-muted)]">{p.description}</p>
                  </div>
                </div>
                <ToggleButton
                  label={prefs[p.key] ? 'Activado' : 'Desactivado'}
                  checked={prefs[p.key]}
                  disabled={isSaving}
                  onChange={() => onToggle(p.key)}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function NotificationsForm() {
  const { user, updateProfile } = useAuth();
  const { showNotice } = useNoticeModal();
  const prefs = user?.notificationPreferences ?? DEFAULT_NOTIFICATIONS;
  const isGym = user?.role === 'institution';
  const [savingKey, setSavingKey] = useState<PrefKey | null>(null);

  const toggle = async (key: PrefKey) => {
    setSavingKey(key);
    try {
      await updateProfile({
        notificationPreferences: { [key]: !prefs[key] },
      });
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: NOTIFICATIONS_LABELS.preferencesSaved,
        variant: 'success',
      });
    } catch (error) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: getAuthErrorMessage(error),
        variant: 'error',
      });
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--fn-border)] bg-gradient-to-br from-[var(--fn-primary-muted)]/40 to-transparent p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--fn-primary)] text-white">
            <Bell size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--fn-text)]">
              {NOTIFICATIONS_LABELS.preferencesTitle}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-[var(--fn-text-muted)]">
              {NOTIFICATIONS_LABELS.preferencesHint}
            </p>
          </div>
        </div>
      </div>

      {isGym ? (
        <PreferenceSection
          title={NOTIFICATIONS_LABELS.sectionAccount}
          items={GYM_PREFS}
          prefs={prefs}
          savingKey={savingKey}
          onToggle={toggle}
        />
      ) : (
        <>
          <PreferenceSection
            title={NOTIFICATIONS_LABELS.sectionBookings}
            items={ATHLETE_BOOKING_PREFS}
            prefs={prefs}
            savingKey={savingKey}
            onToggle={toggle}
          />
          <PreferenceSection
            title={NOTIFICATIONS_LABELS.sectionAccount}
            items={ATHLETE_ACCOUNT_PREFS}
            prefs={prefs}
            savingKey={savingKey}
            onToggle={toggle}
          />
        </>
      )}
    </div>
  );
}
