'use client';

import { Check } from 'lucide-react';

import { formatMoney } from '@/utils/format';
import { paymentOptionKey } from '@/utils/booking-payments';
import type { BillingPeriod, ClassBookingPaymentOptions, PaymentModel } from '@/types/api';

export function PaymentModelPicker({
  options,
  selectedModel,
  selectedPeriod,
  onSelect,
  disabled = false,
}: {
  options: ClassBookingPaymentOptions;
  selectedModel: PaymentModel;
  selectedPeriod?: BillingPeriod;
  onSelect: (paymentModel: PaymentModel, billingPeriod?: BillingPeriod) => void;
  disabled?: boolean;
}) {
  const perClassOptions = options.options.filter((o) => o.paymentModel === 'per_class');
  const monthlyOptions = options.options.filter((o) => o.paymentModel === 'monthly_unlimited');
  const periodOptions = options.options.filter((o) => o.paymentModel === 'per_period');

  const renderOption = (option: (typeof options.options)[number]) => {
    const key = paymentOptionKey(option.paymentModel, option.billingPeriod);
    const selectedKey = paymentOptionKey(selectedModel, selectedPeriod);
    const isSelected = key === selectedKey;

    return (
      <button
        key={key}
        type="button"
        disabled={disabled || option.coveredBySubscription}
        onClick={() => onSelect(option.paymentModel, option.billingPeriod)}
        className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
          isSelected
            ? 'border-[var(--fn-primary)] bg-[var(--fn-primary-muted)]/40 ring-1 ring-[var(--fn-primary)]/30'
            : 'border-[var(--fn-border)] bg-[var(--fn-surface)] hover:border-[var(--fn-primary)]/30'
        } ${disabled || option.coveredBySubscription ? 'opacity-60' : ''}`}
      >
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            isSelected
              ? 'border-[var(--fn-primary)] bg-[var(--fn-primary)] text-white'
              : 'border-[var(--fn-border)] bg-[var(--fn-surface-muted)]'
          }`}
        >
          {isSelected ? <Check size={12} strokeWidth={3} /> : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-[var(--fn-text)]">{option.label}</span>
            <span className="font-bold text-[var(--fn-primary)]">
              {option.coveredBySubscription ? 'Incluido' : formatMoney(option.price)}
            </span>
          </span>
          <span className="mt-1 block text-sm text-[var(--fn-text-muted)]">{option.description}</span>
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-5">
      {perClassOptions.length > 0 ? (
        <section className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--fn-text-muted)]">
            Pago por clase
          </h3>
          <div className="space-y-2">{perClassOptions.map(renderOption)}</div>
        </section>
      ) : null}

      {monthlyOptions.length > 0 ? (
        <section className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--fn-text-muted)]">
            Plan mensual ilimitado
          </h3>
          <div className="space-y-2">{monthlyOptions.map(renderOption)}</div>
        </section>
      ) : null}

      {periodOptions.length > 0 ? (
        <section className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--fn-text-muted)]">
            Pago por período
          </h3>
          <div className="space-y-2">{periodOptions.map(renderOption)}</div>
        </section>
      ) : null}
    </div>
  );
}
