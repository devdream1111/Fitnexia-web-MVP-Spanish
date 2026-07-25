'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Layers, Loader2 } from 'lucide-react';

import {
  GymSaasPlanCards,
  GymSubscriptionBanner,
} from '@/components/gym/gym-saas-plan-cards';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import {
  apiGetGymSubscription,
  apiGetGymTiers,
  apiUpdateGymSubscription,
} from '@/services/api';
import { ApiClientError } from '@/services/api-client';
import {
  ALERT_LABELS,
  GENERAL_LABELS,
  GYM_LABELS,
  PROFILE_MENU_LABELS,
} from '@/constants/labels';
import type { GymSaasTier, GymSubscription, GymTierCatalog } from '@/types/api';
import { pollUntil, type PollHandle } from '@/utils/payment-polling';

export default function GymPlanPage() {
  const { showNotice } = useNoticeModal();
  const [tiers, setTiers] = useState<GymTierCatalog[]>([]);
  const [subscription, setSubscription] = useState<GymSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyTier, setBusyTier] = useState<GymSaasTier | null>(null);
  const [waitingActivation, setWaitingActivation] = useState(false);
  const pollRef = useRef<PollHandle | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tiersRes, sub] = await Promise.all([
        apiGetGymTiers(),
        apiGetGymSubscription(),
      ]);
      setTiers(tiersRes.data);
      setSubscription(sub);
    } catch {
      setTiers([]);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    return () => {
      pollRef.current?.cancel();
    };
  }, [load]);

  // Mercado Pago's back_url returns to the mobile deep link, so on web we
  // detect activation by re-fetching the subscription until the tier flips.
  const startActivationPolling = useCallback(
    (targetTier: GymSaasTier) => {
      setWaitingActivation(true);
      pollRef.current?.cancel();
      pollRef.current = pollUntil(
        async () => {
          const sub = await apiGetGymSubscription();
          setSubscription(sub);
          return sub.tier === targetTier && sub.billingStatus !== 'pending';
        },
        {
          onSuccess: () => {
            setWaitingActivation(false);
            showNotice({
              title: ALERT_LABELS.savedTitle,
              message: GYM_LABELS.saas.tierActivated,
              variant: 'success',
            });
          },
          onTimeout: () => {
            setWaitingActivation(false);
            showNotice({
              title: GYM_LABELS.saas.checkoutOpenedTitle,
              message: GYM_LABELS.saas.activationTimeout,
              variant: 'info',
            });
          },
        },
      );
    },
    [showNotice],
  );

  const handleSelectTier = async (tier: GymSaasTier) => {
    setBusyTier(tier);
    try {
      const updated = await apiUpdateGymSubscription(tier);
      setSubscription(updated);

      const checkoutUrl = updated.checkoutUrl ?? updated.authorizationUrl;
      if (checkoutUrl && updated.billingStatus === 'pending') {
        window.open(checkoutUrl, '_blank', 'noopener');
        showNotice({
          title: GYM_LABELS.saas.checkoutOpenedTitle,
          message: GYM_LABELS.saas.checkoutOpenedBody,
          variant: 'info',
        });
        startActivationPolling(updated.pendingTier ?? tier);
        return;
      }

      // Free tier or no billing required: applied immediately.
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: GYM_LABELS.saas.tierUpdated,
        variant: 'success',
      });
    } catch (error) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: error instanceof ApiClientError ? error.message : GYM_LABELS.plan.loadError,
        variant: 'error',
      });
    } finally {
      setBusyTier(null);
    }
  };

  const pendingTierName = subscription?.pendingTier
    ? tiers.find((t) => t.id === subscription.pendingTier)?.name ?? subscription.pendingTier
    : null;
  const showPendingBanner =
    subscription?.billingStatus === 'pending' && Boolean(subscription?.pendingTier);

  return (
    <div className="space-y-8 pb-8">
      <PageHeader title={PROFILE_MENU_LABELS.planCommission} showBack />

      <section className="relative overflow-hidden rounded-3xl border border-violet-500/15 bg-gradient-to-br from-violet-600/10 via-[var(--fn-surface)] to-indigo-600/5 px-6 py-8 shadow-sm md:px-10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-600">
            <Layers size={22} />
          </span>
          <p className="max-w-2xl text-base leading-relaxed text-[var(--fn-text-secondary)]">
            {GYM_LABELS.plan.planDescription}
          </p>
        </div>
      </section>

      {loading ? (
        <p className="py-12 text-center text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
      ) : (
        <>
          {subscription ? <GymSubscriptionBanner subscription={subscription} /> : null}

          {showPendingBanner ? (
            <div className="space-y-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4">
              <p className="text-sm font-bold text-amber-700 dark:text-amber-200">
                {GYM_LABELS.saas.pendingTierTitle}
              </p>
              <p className="text-sm text-amber-700/90 dark:text-amber-100/80">
                {GYM_LABELS.saas.pendingTierBody(pendingTierName ?? '')}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {subscription?.authorizationUrl ? (
                  <Button
                    title={GYM_LABELS.saas.completePayment}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(subscription.authorizationUrl, '_blank', 'noopener')
                    }
                  />
                ) : null}
                <Button
                  title={GYM_LABELS.saas.refreshBilling}
                  variant="ghost"
                  size="sm"
                  onClick={load}
                />
                {waitingActivation ? (
                  <span className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-200">
                    <Loader2 size={16} className="animate-spin" />
                    {GYM_LABELS.saas.billingPending}
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          <div>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--fn-text-muted)]">
              Planes disponibles
            </h2>
            <GymSaasPlanCards
              tiers={tiers}
              subscription={subscription}
              onSelectTier={handleSelectTier}
              busyTier={busyTier}
            />
          </div>
        </>
      )}
    </div>
  );
}
