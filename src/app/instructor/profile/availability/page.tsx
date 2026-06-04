'use client';

import { PageHeader } from '@/components/layout/page-header';
import { PROFILE_MENU_LABELS } from '@/constants/labels';

export default function AvailabilityPage() {
  return (
    <div>
      <PageHeader title={PROFILE_MENU_LABELS.scheduleAvailability} showBack />
      <p className="text-[var(--fn-text-muted)]">Weekly schedule editor — same mock behavior as mobile.</p>
    </div>
  );
}
