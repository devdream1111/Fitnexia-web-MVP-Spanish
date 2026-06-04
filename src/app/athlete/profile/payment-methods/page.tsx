'use client';

import { PageHeader } from '@/components/layout/page-header';
import { SCREEN_TITLES } from '@/constants/labels';

export default function PaymentMethodsPage() {
  return (
    <div>
      <PageHeader title={SCREEN_TITLES.paymentMethods} showBack />
      <p className="text-[var(--fn-text-muted)]">Saved payment methods — available when integrated payments ship.</p>
    </div>
  );
}
