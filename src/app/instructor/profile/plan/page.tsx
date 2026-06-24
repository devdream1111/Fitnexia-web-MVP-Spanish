'use client';

import { useEffect, useState } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { PlanCards } from '@/components/mvp/plan-cards';
import { apiGetInstructorMe, apiGetPlans, type PlanOption } from '@/services/api';
import { GENERAL_LABELS, INSTRUCTOR_JOB_LABELS, PROFILE_MENU_LABELS } from '@/constants/labels';

export default function InstructorPlanPage() {
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [plansRes, instructor] = await Promise.all([
          apiGetPlans(),
          apiGetInstructorMe().catch(() => null),
        ]);
        if (!cancelled) {
          setPlans(plansRes.data.filter((p) => p.id === 'basic' || p.id === 'pro'));
          setCurrentPlanId(instructor?.plan);
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
      <p className="max-w-2xl text-[var(--fn-text-muted)]">{INSTRUCTOR_JOB_LABELS.planDescription}</p>
      {loading ? (
        <p className="text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
      ) : (
        <PlanCards plans={plans} currentPlanId={currentPlanId} />
      )}
    </div>
  );
}
