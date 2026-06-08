'use client';

import { PageHeader } from '@/components/layout/page-header';
import { PROFILE_MENU_LABELS, GYM_LABELS } from '@/constants/labels';

export default function GymPlanPage() {
  return (
    <div>
      <PageHeader title={PROFILE_MENU_LABELS.planCommission} showBack />
      <p className="text-[var(--fn-text-muted)]">{GYM_LABELS.plan.planDescription}</p>
    </div>
  );
}
