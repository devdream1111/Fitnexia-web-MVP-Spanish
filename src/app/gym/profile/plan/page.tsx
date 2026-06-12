'use client';

import { useEffect, useState } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { PlanCards } from '@/components/mvp/plan-cards';
import { apiGetInstitutionMe, apiGetPlans, type PlanOption } from '@/services/api';
import { GENERAL_LABELS, GYM_LABELS, PROFILE_MENU_LABELS } from '@/constants/labels';

export default function GymPlanPage() {
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [plansRes, institution] = await Promise.all([
          apiGetPlans(),
          apiGetInstitutionMe().catch(() => null),
        ]);
        if (!cancelled) {
          setPlans(plansRes.data);
          setCurrentPlanId(institution?.plan);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title={PROFILE_MENU_LABELS.planCommission} showBack />
      <p className="max-w-2xl text-[var(--fn-text-muted)]">{GYM_LABELS.plan.planDescription}</p>
      {loading ? (
        <p className="text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
      ) : (
        <PlanCards plans={plans} currentPlanId={currentPlanId} />
      )}
    </div>
  );
}
