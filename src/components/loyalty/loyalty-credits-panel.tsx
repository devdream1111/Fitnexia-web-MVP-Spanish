'use client';

import { Sparkles } from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';
import { MOCK_V2V3_LABELS } from '@/constants/labels';
import { formatMoney } from '@/utils/format';
import type { CreditBalance, Money } from '@/types/api';

export function LoyaltyCreditsPanel({
  balance,
  applyCredits,
  onApplyCreditsChange,
  classPrice,
  disabled = false,
}: {
  balance: CreditBalance;
  applyCredits: boolean;
  onApplyCreditsChange: (value: boolean) => void;
  classPrice?: Money;
  disabled?: boolean;
}) {
  const maxValue = balance.maxFreeClassValue;
  const priceOk =
    !classPrice || classPrice.amount <= maxValue.amount;
  const canRedeem = balance.freeClassEligible && priceOk && !disabled;

  return (
    <section className="rounded-2xl border border-[color-mix(in_srgb,var(--fn-primary)_22%,var(--fn-border))] bg-[color-mix(in_srgb,var(--fn-primary-muted)_40%,var(--fn-surface))] p-5">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Sparkles size={18} className="text-[var(--fn-primary)]" />
        <h3 className="m-0 font-bold text-[var(--fn-text)]">{MOCK_V2V3_LABELS.creditsBalance}</h3>
      </div>
      <p className="m-0 text-2xl font-extrabold text-[var(--fn-text)]">{balance.balance}</p>
      <p className="mt-1 m-0 text-sm text-[var(--fn-text-muted)]">
        {MOCK_V2V3_LABELS.creditsHint(balance.balance, balance.creditsUntilReward)}
      </p>
      <p className="mt-1 m-0 text-xs text-[var(--fn-text-muted)]">
        Clase gratis hasta {formatMoney(maxValue)} · 10 créditos por canje
      </p>
      {balance.freeClassEligible && !priceOk ? (
        <p className="mt-2 m-0 text-sm text-[var(--fn-error)]">
          Esta clase supera el tope de canje ({formatMoney(maxValue)}).
        </p>
      ) : null}
      {canRedeem ? (
        <div className="mt-3">
          <Checkbox
            label={MOCK_V2V3_LABELS.creditsApply}
            checked={applyCredits}
            onChange={() => onApplyCreditsChange(!applyCredits)}
          />
        </div>
      ) : null}
    </section>
  );
}
