'use client';

import { useMemo } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { usePayments } from '@/contexts/payments-context';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { formatMoney, formatClassDate } from '@/data/mock';
import { SCREEN_TITLES, GENERAL_LABELS } from '@/constants/labels';
import type { Payment, ClassListItem } from '@/types/api';

export default function PaymentHistoryPage() {
  const { getPaymentsForUser } = usePayments();
  const { getClassById } = useClasses();
  const { user } = useAuth();

  const userPayments = user ? getPaymentsForUser(user.id) : [];

  const entries = useMemo(() => {
    return userPayments
      .map((payment) => {
        const cls = getClassById(payment.bookingId);
        return { payment, cls };
      });
  }, [userPayments, getClassById]);

  return (
    <div>
      <PageHeader title={SCREEN_TITLES.paymentHistory} showBack />
      
      <div className="mt-6">
        {entries.length === 0 ? (
          <p className="text-[var(--fn-text-muted)]">{GENERAL_LABELS.noPaymentHistoryYet}</p>
        ) : (
          entries.map(({ payment, cls }) => (
            <div
              key={payment.id}
              className="mb-4 rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-lg">{cls?.title || GENERAL_LABELS.classBooking}</p>
                  <p className="text-sm text-[var(--fn-text-muted)] mt-1">
                    {new Date(payment.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="mt-2 text-sm">
                    {formatMoney(payment.amount)} · {payment.paymentMethod}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  payment.status === 'paid' 
                    ? 'bg-blue-100 text-blue-800' 
                    : payment.status === 'refunded'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {payment.status === 'paid' 
                    ? GENERAL_LABELS.paid 
                    : payment.status === 'refunded' 
                    ? GENERAL_LABELS.refunded 
                    : payment.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
