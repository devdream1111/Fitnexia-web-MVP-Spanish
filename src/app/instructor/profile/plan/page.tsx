'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { PlanCards } from '@/components/mvp/plan-cards';
import { Button } from '@/components/ui/button';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import {
  apiGetInstructorMe,
  apiGetPlans,
  apiSubscribeInstructorPlan,
  type PlanOption,
} from '@/services/api';
import { ApiClientError } from '@/services/api-client';
import {
  ALERT_LABELS,
  GENERAL_LABELS,
  INSTRUCTOR_JOB_LABELS,
  INSTRUCTOR_PLAN_LABELS,
  PROFILE_MENU_LABELS,
} from '@/constants/labels';
import type { InstructorPlan } from '@/types/api';
import { pollUntil, type PollHandle } from '@/utils/payment-polling';

const L = INSTRUCTOR_PLAN_LABELS;

export default function InstructorPlanPage() {
  const { showNotice } = useNoticeModal();
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string | undefined>();
  const [pendingPlanId, setPendingPlanId] = useState<string | undefined>();
  const [pendingCheckoutUrl, setPendingCheckoutUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);
  const [waitingActivation, setWaitingActivation] = useState(false);
  const pollRef = useRef<PollHandle | null>(null);

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
      pollRef.current?.cancel();
    };
  }, []);

  // The Mercado Pago back_url returns to the mobile deep link, so on web we
  // detect activation by polling the instructor profile until the plan flips.
  const startActivationPolling = useCallback(
    (targetPlan: string) => {
      setWaitingActivation(true);
      pollRef.current?.cancel();
      pollRef.current = pollUntil(
        async () => {
          const instructor = await apiGetInstructorMe();
          return instructor.plan === targetPlan;
        },
        {
          onSuccess: () => {
            setCurrentPlanId(targetPlan);
            setPendingPlanId(undefined);
            setPendingCheckoutUrl(undefined);
            setWaitingActivation(false);
            showNotice({
              title: ALERT_LABELS.savedTitle,
              message: L.subscribeSuccess,
              variant: 'success',
            });
          },
          onTimeout: () => {
            setWaitingActivation(false);
            showNotice({
              title: L.checkoutOpenedTitle,
              message: L.activationTimeout,
              variant: 'info',
            });
          },
        },
      );
    },
    [showNotice],
  );

  const handleSelectPlan = async (planId: string) => {
    setBusyPlanId(planId);
    try {
      const result = await apiSubscribeInstructorPlan(planId as InstructorPlan);
      const checkoutUrl = result.checkoutUrl ?? result.authorizationUrl;

      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank', 'noopener');
        setPendingPlanId(result.pendingPlan ?? planId);
        setPendingCheckoutUrl(checkoutUrl);
        showNotice({
          title: L.checkoutOpenedTitle,
          message: L.checkoutOpenedBody,
          variant: 'info',
        });
        startActivationPolling(planId);
        return;
      }

      // Free plan: activated immediately, no checkout involved.
      setCurrentPlanId(result.plan ?? planId);
      setPendingPlanId(undefined);
      setPendingCheckoutUrl(undefined);
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: L.subscribeSuccess,
        variant: 'success',
      });
    } catch (error) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: error instanceof ApiClientError ? error.message : L.subscribeError,
        variant: 'error',
      });
    } finally {
      setBusyPlanId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={PROFILE_MENU_LABELS.planCommission} showBack />
      <p className="max-w-2xl text-[var(--fn-text-muted)]">{INSTRUCTOR_JOB_LABELS.planDescription}</p>
      {loading ? (
        <p className="text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
      ) : (
        <>
          {waitingActivation || pendingCheckoutUrl ? (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm">
              {waitingActivation ? (
                <span className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-200">
                  <Loader2 size={16} className="animate-spin" />
                  {L.waitingActivation}
                </span>
              ) : null}
              {pendingCheckoutUrl ? (
                <Button
                  title={L.completePayment}
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(pendingCheckoutUrl, '_blank', 'noopener')}
                />
              ) : null}
            </div>
          ) : null}
          <PlanCards
            plans={plans}
            currentPlanId={currentPlanId}
            pendingPlanId={pendingPlanId}
            onSelectPlan={handleSelectPlan}
            busyPlanId={busyPlanId}
          />
        </>
      )}
    </div>
  );
}
