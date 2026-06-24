'use client';

import { Check, Crown, Gem, Sparkles, Users, Zap } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DEFAULT_CURRENCY } from '@/constants/fitnexia';
import { GYM_LABELS } from '@/constants/labels';
import type { GymSaasTier, GymSubscription, GymTierCatalog } from '@/types/api';
import { formatMoneyFromCents } from '@/utils/format';

const TIER_VISUAL: Record<
  GymSaasTier,
  { icon: typeof Sparkles; gradient: string; ring: string; glow: string }
> = {
  basic: {
    icon: Users,
    gradient: 'from-slate-600/20 via-slate-500/10 to-transparent',
    ring: 'ring-slate-400/30',
    glow: 'shadow-slate-500/10',
  },
  professional: {
    icon: Zap,
    gradient: 'from-blue-600/20 via-indigo-500/10 to-transparent',
    ring: 'ring-blue-500/35',
    glow: 'shadow-blue-500/15',
  },
  premium: {
    icon: Gem,
    gradient: 'from-violet-600/25 via-fuchsia-500/10 to-transparent',
    ring: 'ring-violet-500/40',
    glow: 'shadow-violet-500/20',
  },
  enterprise: {
    icon: Crown,
    gradient: 'from-amber-500/25 via-orange-500/10 to-transparent',
    ring: 'ring-amber-500/40',
    glow: 'shadow-amber-500/20',
  },
};

function tierFeatures(tier: GymTierCatalog): string[] {
  const features: string[] = [];
  const limit =
    tier.memberLimit != null
      ? `Hasta ${tier.memberLimit} socios activos`
      : 'Socios ilimitados';
  features.push(limit);
  features.push('0% comisión Fitnexia en cuotas de socios');
  if (tier.entitlements.manualPayments) features.push('Cobros manuales (efectivo, transferencia)');
  if (tier.entitlements.clubProfile) features.push('Perfil público del club');
  if (tier.entitlements.jobPostings) features.push('Publicación de empleos');
  if (tier.entitlements.recurringBilling) features.push('Débito automático de socios (V1)');
  if (tier.entitlements.reportsBasic) features.push('Reportes básicos (V1)');
  return features;
}

export function GymSubscriptionBanner({ subscription }: { subscription: GymSubscription }) {
  const visual = TIER_VISUAL[subscription.tier] ?? TIER_VISUAL.basic;
  const Icon = visual.icon;
  const limitLabel =
    subscription.memberLimit != null
      ? `${subscription.memberCount}/${subscription.memberLimit}`
      : `${subscription.memberCount}`;
  const usagePercent =
    subscription.memberLimit != null && subscription.memberLimit > 0
      ? Math.min(100, Math.round((subscription.memberCount / subscription.memberLimit) * 100))
      : 0;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-xl ${visual.glow}`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${visual.gradient}`} />
      <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="flex items-start gap-4">
          <span
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--fn-surface)] shadow-md ring-2 ${visual.ring}`}
          >
            <Icon size={26} className="text-[var(--fn-primary)]" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--fn-text-muted)]">
              {GYM_LABELS.saas.currentPlan}
            </p>
            <h2 className="mt-1 text-3xl font-black text-[var(--fn-text)]">{subscription.tierName}</h2>
            <p className="mt-1 text-sm text-[var(--fn-text-muted)]">
              {subscription.monthlyFeeCents === 0
                ? 'Gratis'
                : `${formatMoneyFromCents(subscription.monthlyFeeCents, DEFAULT_CURRENCY)}/mes`}
              {' · '}
              {GYM_LABELS.saas.billingManual}
            </p>
          </div>
        </div>
        <div className="min-w-[200px] rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)]/80 p-5 backdrop-blur-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--fn-text-muted)]">
            {GYM_LABELS.saas.memberUsage}
          </p>
          <p
            className={`mt-1 text-4xl font-black ${subscription.atLimit ? 'text-[var(--fn-error)]' : 'text-[var(--fn-primary)]'}`}
          >
            {limitLabel}
          </p>
          {subscription.memberLimit != null ? (
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--fn-surface-muted)]">
              <div
                className={`h-full rounded-full transition-all ${subscription.atLimit ? 'bg-red-500' : 'bg-[var(--fn-primary)]'}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          ) : null}
          {subscription.atLimit ? (
            <Badge label={GYM_LABELS.saas.atLimit} variant="danger" size="sm" />
          ) : subscription.membersRemaining != null ? (
            <p className="mt-2 text-xs text-[var(--fn-text-muted)]">
              {GYM_LABELS.saas.remaining(subscription.membersRemaining)}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function GymSaasPlanCards({
  tiers,
  subscription,
  onSelectTier,
  busyTier,
}: {
  tiers: GymTierCatalog[];
  subscription?: GymSubscription | null;
  onSelectTier?: (tier: GymSaasTier) => void;
  busyTier?: GymSaasTier | null;
}) {
  const currentTier = subscription?.tier;

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {tiers.map((tier) => {
        const isCurrent = tier.id === currentTier;
        const features = tierFeatures(tier);
        const visual = TIER_VISUAL[tier.id] ?? TIER_VISUAL.basic;
        const Icon = visual.icon;
        return (
          <article
            key={tier.id}
            className={[
              'relative flex flex-col overflow-hidden rounded-3xl border p-6 transition duration-300',
              isCurrent
                ? `border-[var(--fn-primary)] bg-[var(--fn-surface)] shadow-2xl ring-2 ring-[var(--fn-primary)]/25 ${visual.glow}`
                : 'border-[var(--fn-border)] bg-[var(--fn-surface)] hover:-translate-y-1 hover:shadow-xl',
            ].join(' ')}
          >
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${visual.gradient}`} />
            <div className="relative flex flex-1 flex-col">
              <div className="mb-4 flex items-center justify-between">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--fn-surface)] shadow-sm ring-1 ${visual.ring}`}
                >
                  <Icon size={20} className="text-[var(--fn-primary)]" />
                </span>
                {isCurrent ? (
                  <Badge label={GYM_LABELS.saas.currentBadge} variant="success" size="sm" />
                ) : null}
              </div>
              <h3 className="text-xl font-black text-[var(--fn-text)]">{tier.name}</h3>
              <p className="mt-2 text-3xl font-black text-[var(--fn-primary)]">
                {tier.monthlyFeeCents === 0
                  ? 'Gratis'
                  : formatMoneyFromCents(tier.monthlyFeeCents, DEFAULT_CURRENCY)}
                {tier.monthlyFeeCents > 0 ? (
                  <span className="text-sm font-medium text-[var(--fn-text-muted)]"> /mes</span>
                ) : null}
              </p>
              <ul className="mt-5 flex-1 space-y-2.5 text-sm text-[var(--fn-text-secondary)]">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={15} className="mt-0.5 shrink-0 text-[var(--fn-success)]" />
                    {f}
                  </li>
                ))}
              </ul>
              {onSelectTier && !isCurrent ? (
                <Button
                  title={GYM_LABELS.saas.selectPlan}
                  variant="outline"
                  size="sm"
                  className="mt-6 w-full"
                  loading={busyTier === tier.id}
                  onClick={() => onSelectTier(tier.id)}
                />
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function MemberLimitAlert({ subscription }: { subscription: GymSubscription }) {
  if (!subscription.atLimit) return null;
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-500/10 to-orange-500/5 px-5 py-4 text-sm text-red-800 shadow-sm dark:text-red-100">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-600">
        !
      </span>
      <p className="leading-relaxed">{GYM_LABELS.saas.memberLimitReached(subscription.memberLimit ?? 0)}</p>
    </div>
  );
}
