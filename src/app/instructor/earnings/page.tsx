'use client';

import { EarningsDashboard } from '@/components/mvp/earnings-dashboard';
import { DASHBOARD_GRADIENTS } from '@/components/dashboard/dashboard-ui';
import { INSTRUCTOR_LABELS } from '@/constants/labels';

export default function InstructorEarningsPage() {
  return (
    <EarningsDashboard
      eyebrow="Ingresos · Fitnexia"
      title={INSTRUCTOR_LABELS.earnings.yourEarnings}
      gradient={DASHBOARD_GRADIENTS.instructor}
    />
  );
}
