'use client';

import { Sparkles } from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';
import { MOCK_V2V3_LABELS } from '@/constants/labels';
import type { CreditBalance } from '@/types/api';
import { MockDataBadge } from '@/components/mock-v2v3/mock-data-badge';

export function LoyaltyCreditsPanel({
  balance,
  applyCredits,
  onApplyCreditsChange,
}: {
  balance: CreditBalance;
  applyCredits: boolean;
  onApplyCreditsChange: (value: boolean) => void;
}) {
  return (
    <section className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Sparkles size={18} className="text-amber-600" />
        <h3 className="font-bold text-[var(--fn-text)]">{MOCK_V2V3_LABELS.creditsBalance}</h3>
        <MockDataBadge />
      </div>
      <p className="text-sm text-[var(--fn-text-muted)]">
        {MOCK_V2V3_LABELS.creditsHint(balance.balance, balance.creditsUntilReward)}
      </p>
      <Checkbox
        label={MOCK_V2V3_LABELS.creditsApply}
        checked={applyCredits}
        onChange={() => onApplyCreditsChange(!applyCredits)}
      />
    </section>
  );
}
