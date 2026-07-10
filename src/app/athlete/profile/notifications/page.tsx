'use client';

import { NotificationsForm } from '@/components/profile/notifications-form';
import { PageHeader } from '@/components/layout/page-header';
import { GENERAL_LABELS, SCREEN_TITLES } from '@/constants/labels';

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-4">
      <PageHeader
        variant="premium"
        title={SCREEN_TITLES.notifications}
        eyebrow={GENERAL_LABELS.athleteNotificationsEyebrow}
        subtitle={GENERAL_LABELS.athleteNotificationsSubtitle}
        showBack
        backHref="/athlete/profile"
      />
      <div className="rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-6">
        <NotificationsForm />
      </div>
    </div>
  );
}
