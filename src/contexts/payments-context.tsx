'use client';

import React, { createContext, useCallback, useContext, useMemo } from 'react';

import { useBookings } from '@/contexts/bookings-context';
import { useAuth } from '@/contexts/auth-context';
import type { Payment } from '@/types/api';

interface PaymentsContextValue {
  payments: Payment[];
  getPaymentsForUser: (userId: string) => Payment[];
}

const PaymentsContext = createContext<PaymentsContextValue | null>(null);

export function PaymentsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { bookings } = useBookings();

  const payments = useMemo<Payment[]>(() => {
    if (!user || user.role !== 'athlete') return [];
    return bookings
      .filter((b) => ['confirmed', 'completed', 'refunded'].includes(b.status))
      .map((b) => ({
        id: b.id,
        bookingId: b.id,
        userId: b.userId,
        amount: b.price,
        status:
          b.status === 'refunded'
            ? ('refunded' as const)
            : b.status === 'confirmed' || b.status === 'completed'
              ? ('paid' as const)
              : ('pending' as const),
        paymentMethod: 'mercado_pago',
        createdAt: b.createdAt,
        updatedAt: b.createdAt,
      }));
  }, [bookings, user]);

  const getPaymentsForUser = useCallback(
    (userId: string) =>
      payments
        .filter((p) => p.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [payments],
  );

  const value = useMemo(
    () => ({ payments, getPaymentsForUser }),
    [payments, getPaymentsForUser],
  );

  return <PaymentsContext.Provider value={value}>{children}</PaymentsContext.Provider>;
}

export function usePayments() {
  const ctx = useContext(PaymentsContext);
  if (!ctx) throw new Error('usePayments must be used within PaymentsProvider');
  return ctx;
}
