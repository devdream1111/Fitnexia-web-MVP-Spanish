'use client';

import { useEffect, useState } from 'react';
import { Layers } from 'lucide-react';

import {
  GymSaasPlanCards,
  GymSubscriptionBanner,
} from '@/components/gym/gym-saas-plan-cards';
import { PageHeader } from '@/components/layout/page-header';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import {
  apiGetGymSubscription,
  apiGetGymTiers,
  apiUpdateGymSubscription,
} from '@/services/api';
import { ApiClientError } from '@/services/api-client';
import { GymBillingPanel } from '@/components/mock-v2v3/gym-plan-panels';
import { MockDataBadge } from '@/components/mock-v2v3/mock-data-badge';
import { ALERT_LABELS, GENERAL_LABELS, GYM_LABELS, MOCK_V2V3_LABELS, PROFILE_MENU_LABELS } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';
import { useAuth } from '@/contexts/auth-context';
import { resolveInstitutionId } from '@/utils/gym-classes';
import type { GymSaasTier, GymSubscription, GymTierCatalog } from '@/types/api';

export default function GymPlanPage() {
  const { showNotice } = useNoticeModal();
  const { user } = useAuth();
  const showGymBilling = useFeature('gymSaasBilling');
  const institutionId = resolveInstitutionId(user) || 'mock-gym';
  const [tiers, setTiers] = useState<GymTierCatalog[]>([]);
  const [subscription, setSubscription] = useState<GymSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyTier, setBusyTier] = useState<GymSaasTier | null>(null);

  const load = async () => {
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
  };

  useEffect(() => {
    load();
  }, []);

  const handleSelectTier = async (tier: GymSaasTier) => {
    setBusyTier(tier);
    try {
      const updated = await apiUpdateGymSubscription(tier);
      setSubscription(updated);
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
          {showGymBilling && subscription ? (
            <div className="space-y-2">
              <MockDataBadge />
              <GymBillingPanel
                institutionId={institutionId}
                monthlyFeeCents={subscription.monthlyFeeCents}
              />
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
