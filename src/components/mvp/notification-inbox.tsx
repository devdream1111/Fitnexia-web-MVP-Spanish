'use client';

import Link from 'next/link';
import { Bell, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { NOTIFICATIONS_LABELS } from '@/constants/labels';

export function NotificationInboxEmpty({
  preferencesHref,
  hint,
}: {
  preferencesHref: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--fn-border)] bg-gradient-to-br from-[var(--fn-surface-muted)]/40 to-transparent px-6 py-14 text-center">
      <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]">
        <Bell size={28} />
      </span>
      <p className="font-semibold text-[var(--fn-text)]">{NOTIFICATIONS_LABELS.noNotificationsYet}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--fn-text-muted)]">
        {hint ??
          'Las alertas de reservas y pagos aparecerán aquí cuando estén activas. Mientras tanto, ajusta tus preferencias.'}
      </p>
      <Link href={preferencesHref} className="mt-6 inline-block">
        <Button variant="outline" size="sm">
          <Settings size={16} className="mr-2" />
          {NOTIFICATIONS_LABELS.managePreferences}
        </Button>
      </Link>
    </div>
  );
}
