'use client';

import { PageHeader } from '@/components/layout/page-header';
import { PROFILE_MENU_LABELS } from '@/constants/labels';

export default function PlanPage() {
  return (
    <div>
      <PageHeader title={PROFILE_MENU_LABELS.planCommission} showBack />
      <p className="text-[var(--fn-text-muted)]">Pro plan · 12% commission (mock).</p>
    </div>
  );
}
