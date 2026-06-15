'use client';

import { PageHeader } from '@/components/layout/page-header';
import { TAB_LABELS } from '@/constants/labels';
import { useClasses } from '@/contexts/classes-context';
import { MOCK_BOOKINGS } from '@/data/mock';
import { formatMoney } from '@/utils/format';
import { Badge } from '@/components/ui/badge';
import type { BookingStatus } from '@/types/api';

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending_payment: 'Pago pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  refunded: 'Reembolsada',
  completed: 'Completada',
  no_show: 'No asistió',
};

const STATUS_VARIANT: Record<BookingStatus, 'default' | 'success' | 'warning' | 'danger'> = {
  pending_payment: 'warning',
  confirmed: 'success',
  cancelled: 'default',
  refunded: 'default',
  completed: 'success',
  no_show: 'danger',
};

export default function AdminBookingsPage() {
  const { getClassById } = useClasses();

  return (
    <div className="space-y-6">
      <PageHeader title={TAB_LABELS.admin.bookings} showBack />
      <div className="overflow-hidden rounded-xl bg-[var(--fn-surface)]">
        {MOCK_BOOKINGS.map((booking) => {
          const cls = getClassById(booking.classId);
          return (
            <div
              key={booking.id}
              className="flex flex-col gap-2 border-b border-[var(--fn-border)] p-4 last:border-b-0 hover:bg-[var(--fn-surface-muted)] md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-semibold text-[var(--fn-text)]">
                  {cls?.title ?? `Clase ${booking.classId}`}
                </p>
                <p className="text-sm text-[var(--fn-text-muted)]">
                  Reserva #{booking.id} · Usuario {booking.userId}
                </p>
                <p className="text-xs text-[var(--fn-text-muted)]">
                  {new Date(booking.createdAt).toLocaleDateString('es-UY')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  label={STATUS_LABELS[booking.status]}
                  variant={STATUS_VARIANT[booking.status]}
                />
                <span className="font-semibold text-[var(--fn-primary)]">{formatMoney(booking.price)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
