'use client';

import { Wallet } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { MOCK_V2V3_LABELS } from '@/constants/labels';
import { MockDataBadge } from '@/components/mock-v2v3/mock-data-badge';

export function DigitalWalletsPanel({
  onSelect,
  disabled,
}: {
  onSelect: (wallet: 'apple' | 'google') => void;
  disabled?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Wallet size={18} className="text-[var(--fn-primary)]" />
        <h3 className="font-bold text-[var(--fn-text)]">{MOCK_V2V3_LABELS.digitalWallets}</h3>
        <MockDataBadge />
      </div>
      <p className="mb-4 text-sm text-[var(--fn-text-muted)]">{MOCK_V2V3_LABELS.walletDemoNote}</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          title={MOCK_V2V3_LABELS.payWithApplePay}
          variant="outline"
          className="flex-1 bg-black text-white hover:opacity-90"
          disabled={disabled}
          onClick={() => onSelect('apple')}
        />
        <Button
          title={MOCK_V2V3_LABELS.payWithGooglePay}
          variant="outline"
          className="flex-1"
          disabled={disabled}
          onClick={() => onSelect('google')}
        />
      </div>
    </section>
  );
}
