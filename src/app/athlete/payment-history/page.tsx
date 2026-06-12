'use client';

import { useEffect, useMemo, useState } from 'react';
import { Receipt } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { useBookings } from '@/contexts/bookings-context';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { apiGetPayment, type PaymentDetail } from '@/services/api';
import { formatMoney, formatClassDate } from '@/utils/format';
import { SCREEN_TITLES, GENERAL_LABELS } from '@/constants/labels';
import type { BookingRecord } from '@/services/api';

function PaymentEntry({
  booking,
  clsTitle,
  clsDate,
}: {
  booking: BookingRecord;
  clsTitle: string;
  clsDate?: string;
}) {
  const [payment, setPayment] = useState<PaymentDetail | null>(null);

  useEffect(() => {
    if (!booking.paymentId) return;
    apiGetPayment(booking.paymentId)
      .then(setPayment)
      .catch(() => setPayment(null));
  }, [booking.paymentId]);

  const statusLabel = payment?.status ?? booking.status;
  const amount = payment?.amount ?? booking.price;

  return (
    <article className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]">
            <Receipt size={18} />
          </span>
          <div className="min-w-0">
            <p className="font-bold text-[var(--fn-text)]">{clsTitle}</p>
            {clsDate ? (
              <p className="text-sm text-[var(--fn-text-muted)]">{clsDate}</p>
            ) : null}
            <p className="mt-2 text-lg font-bold text-[var(--fn-primary)]">{formatMoney(amount)}</p>
            {payment?.provider ? (
              <p className="mt-1 text-xs text-[var(--fn-text-muted)]">
                {payment.provider} · {new Date(payment.createdAt).toLocaleDateString('es-ES')}
              </p>
            ) : null}
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-[var(--fn-surface-muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--fn-text-muted)]">
          {statusLabel}
        </span>
      </div>
    </article>
  );
}

export default function PaymentHistoryPage() {
  const { bookings } = useBookings();
  const { getClassById } = useClasses();
  const { user } = useAuth();

  const entries = useMemo(() => {
    if (!user) return [];
    return bookings
      .filter((b) => b.userId === user.id && ['confirmed', 'completed', 'refunded'].includes(b.status))
      .map((booking) => ({
        booking,
        cls: getClassById(booking.classId),
      }));
  }, [bookings, user, getClassById]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title={SCREEN_TITLES.paymentHistory} showBack />

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--fn-border)] px-6 py-14 text-center">
          <p className="text-[var(--fn-text-muted)]">{GENERAL_LABELS.noPaymentHistoryYet}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map(({ booking, cls }) => (
            <PaymentEntry
              key={booking.id}
              booking={booking}
              clsTitle={cls?.title ?? 'Clase'}
              clsDate={cls ? formatClassDate(cls.startAt) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
