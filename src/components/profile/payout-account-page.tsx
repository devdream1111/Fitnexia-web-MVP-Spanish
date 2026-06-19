'use client';

import { Wallet } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import { PAYOUT_ACCOUNT_LABELS } from '@/constants/labels';

export function PayoutAccountPageContent() {
  const { showNotice } = useNoticeModal();

  const handleConnect = () => {
    showNotice({
      title: PAYOUT_ACCOUNT_LABELS.connectNoticeTitle,
      message: PAYOUT_ACCOUNT_LABELS.connectNoticeMessage,
      variant: 'info',
    });
  };

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col">
      <PageHeader title={PAYOUT_ACCOUNT_LABELS.title} showBack />

      <p className="mb-8 text-sm leading-relaxed text-[var(--fn-text-muted)]">
        {PAYOUT_ACCOUNT_LABELS.intro}
      </p>

      <section className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--fn-primary)]/20 bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]">
            <Wallet size={24} strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-[var(--fn-text)]">
              {PAYOUT_ACCOUNT_LABELS.provider}
            </p>
            <p className="mt-1 text-sm text-[var(--fn-text-muted)]">
              {PAYOUT_ACCOUNT_LABELS.statusLabel}:{' '}
              <span className="font-medium text-[var(--fn-text-secondary)]">
                {PAYOUT_ACCOUNT_LABELS.statusDisconnected}
              </span>
            </p>
            <p className="mt-3 text-sm font-medium leading-relaxed text-[var(--fn-primary)]">
              {PAYOUT_ACCOUNT_LABELS.marketplacePending}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-auto pt-10">
        <Button
          title={PAYOUT_ACCOUNT_LABELS.connect}
          className="w-full"
          size="md"
          onClick={handleConnect}
        />
      </div>
    </div>
  );
}
