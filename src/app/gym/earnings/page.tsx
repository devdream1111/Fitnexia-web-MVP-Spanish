'use client';

import { EarningsDashboard } from '@/components/mvp/earnings-dashboard';
import { DASHBOARD_GRADIENTS } from '@/components/dashboard/dashboard-ui';
import { GYM_LABELS } from '@/constants/labels';

export default function GymEarningsPage() {
  return (
    <EarningsDashboard
      eyebrow="Ingresos · Fitnexia"
      title={GYM_LABELS.earnings.yourEarnings}
      gradient={DASHBOARD_GRADIENTS.gym}
    />
  );
}
