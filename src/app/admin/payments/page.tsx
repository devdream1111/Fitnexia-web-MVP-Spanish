'use client';

import { PageHeader } from '@/components/layout/page-header';
import { TAB_LABELS } from '@/constants/labels';
import { formatMoney } from '@/utils/format';
import { MOCK_PAYMENTS } from '@/data/mock';
import { Badge } from '@/components/ui/badge';

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  paid: 'Pagado',
  pending: 'Pendiente',
  failed: 'Fallido',
  refunded: 'Reembolsado',
};

export default function AdminPaymentsPage() {
  const totalCents = MOCK_PAYMENTS.reduce((sum, p) => sum + p.amount.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader title={TAB_LABELS.admin.payments} showBack />

      <div className="rounded-xl bg-[var(--fn-surface)] p-6">
        <p className="text-sm text-[var(--fn-text-muted)]">Ingresos totales (simulado)</p>
        <p className="text-3xl font-extrabold text-[var(--fn-text)]">
          {formatMoney({ amount: totalCents, currency: 'USD' })}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl bg-[var(--fn-surface)]">
        {MOCK_PAYMENTS.map((payment) => (
          <div
            key={payment.id}
            className="flex flex-col gap-2 border-b border-[var(--fn-border)] p-4 last:border-b-0 hover:bg-[var(--fn-surface-muted)] md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="font-semibold text-[var(--fn-text)]">Pago #{payment.id}</p>
              <p className="text-sm text-[var(--fn-text-muted)]">
                {payment.paymentMethod} · Reserva {payment.bookingId}
              </p>
              <p className="text-xs text-[var(--fn-text-muted)]">
                {new Date(payment.createdAt).toLocaleDateString('es-AR')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                label={PAYMENT_STATUS_LABELS[payment.status] ?? payment.status}
                variant={payment.status === 'paid' ? 'success' : 'default'}
              />
              <span className="font-semibold text-[var(--fn-primary)]">{formatMoney(payment.amount)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
