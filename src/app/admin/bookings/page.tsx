'use client';

import { Calendar } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { TAB_LABELS } from '@/constants/labels';
import { useAdmin } from '@/contexts/admin-context';
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
  const { apiConnected, metrics } = useAdmin();
  const bookings = apiConnected ? [] : MOCK_BOOKINGS;

  return (
    <div className="space-y-6">
      <PageHeader title={TAB_LABELS.admin.bookings} showBack />

      {apiConnected && (
        <div className="rounded-xl bg-[var(--fn-surface)] p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--fn-primary-muted)]">
            <Calendar size={28} className="text-[var(--fn-primary)]" />
          </div>
          <p className="text-lg font-semibold text-[var(--fn-text)]">
            {metrics?.confirmedBookings ?? 0} reservas confirmadas en la plataforma
          </p>
          <p className="mt-2 text-sm text-[var(--fn-text-muted)]">
            El backend expone el total agregado en métricas. El listado detallado de reservas estará disponible en una próxima versión de la API.
          </p>
        </div>
      )}

      {!apiConnected && (
        <div className="overflow-hidden rounded-xl bg-[var(--fn-surface)]">
          {bookings.map((booking) => {
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
                  <Badge label={STATUS_LABELS[booking.status]} variant={STATUS_VARIANT[booking.status]} />
                  <span className="font-semibold text-[var(--fn-text)]">
                    {formatMoney(booking.price)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
