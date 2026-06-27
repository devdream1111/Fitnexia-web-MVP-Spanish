'use client';

import { Check } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { DEFAULT_CURRENCY } from '@/constants/fitnexia';
import { formatMoneyFromCents } from '@/utils/format';
import type { PlanOption } from '@/services/api';

export function PlanCards({
  plans,
  currentPlanId,
}: {
  plans: PlanOption[];
  currentPlanId?: string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {plans.map((plan) => {
        const isCurrent = plan.id === currentPlanId;
        return (
          <article
            key={plan.id}
            className={[
              'relative overflow-hidden rounded-2xl border p-6 transition',
              isCurrent
                ? 'border-[var(--fn-primary)] bg-gradient-to-br from-[var(--fn-primary-muted)]/60 to-[var(--fn-surface)] shadow-lg ring-2 ring-[var(--fn-primary)]/20'
                : 'border-[var(--fn-border)] bg-[var(--fn-surface)] hover:border-[var(--fn-primary)]/30',
            ].join(' ')}
          >
            {isCurrent ? (
              <div className="mb-3">
                <Badge label="Plan actual" variant="success" size="sm" />
              </div>
            ) : null}
            <h3 className="text-xl font-extrabold text-[var(--fn-text)]">{plan.name}</h3>
            <p className="mt-2 text-3xl font-black text-[var(--fn-primary)]">
              {plan.monthlyFeeCents === 0
                ? 'Gratis'
                : formatMoneyFromCents(plan.monthlyFeeCents, DEFAULT_CURRENCY)}
              {plan.monthlyFeeCents > 0 ? (
                <span className="text-sm font-medium text-[var(--fn-text-muted)]"> /mes</span>
              ) : null}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--fn-text-secondary)]">
              <li className="flex items-center gap-2">
                <Check size={16} className="shrink-0 text-[var(--fn-success)]" />
                Comisión {plan.commissionPercent}%
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="shrink-0 text-[var(--fn-success)]" />
                Gestión de clases y reservas
              </li>
            </ul>
          </article>
        );
      })}
    </div>
  );
}
