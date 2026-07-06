'use client';

import { Select } from '@/components/ui/select';
import { MOCK_V2V3_LABELS } from '@/constants/labels';
import { mockCurrencyService, type MockDisplayCurrency } from '@/services/mock/currency.mock';
import { MockDataBadge } from '@/components/mock-v2v3/mock-data-badge';

const OPTIONS = [
  { value: 'UYU', label: 'Peso uruguayo (UYU)' },
  { value: 'USD', label: 'Dólar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
];

export function DisplayCurrencySelector({
  value,
  onChange,
}: {
  value: MockDisplayCurrency;
  onChange: (currency: MockDisplayCurrency) => void;
}) {
  return (
    <section className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="font-bold text-[var(--fn-text)]">{MOCK_V2V3_LABELS.displayCurrency}</h3>
        <MockDataBadge />
      </div>
      <p className="mb-4 text-sm text-[var(--fn-text-muted)]">{MOCK_V2V3_LABELS.displayCurrencyHint}</p>
      <Select
        label={MOCK_V2V3_LABELS.displayCurrency}
        value={value}
        onChange={(v) => onChange(v as MockDisplayCurrency)}
        options={OPTIONS}
      />
    </section>
  );
}

export function useDisplayCurrency() {
  if (typeof window === 'undefined') {
    return { currency: mockCurrencyService.getDisplayCurrency(), convert: mockCurrencyService.convertFromUyu };
  }
  return {
    currency: mockCurrencyService.getDisplayCurrency(),
    convert: mockCurrencyService.convertFromUyu,
    setCurrency: mockCurrencyService.setDisplayCurrency,
  };
}
