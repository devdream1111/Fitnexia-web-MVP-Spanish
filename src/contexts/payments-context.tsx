'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type { Payment } from '@/types/api';
import { 
  MOCK_PAYMENTS, 
  addPayment as addPaymentMock, 
  getPaymentsForUser as getPaymentsForUserMock 
} from '@/data/mock';

interface PaymentsContextValue {
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => Payment;
  getPaymentsForUser: (userId: string) => Payment[];
}

const PaymentsContext = createContext<PaymentsContextValue | null>(null);

export function PaymentsProvider({ children }: { children: React.ReactNode }) {
  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS);

  const addPayment = useCallback(
    (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newPayment = addPaymentMock(payment);
      setPayments([...payments, newPayment]);
      return newPayment;
    },
    [payments]
  );

  const getPaymentsForUser = useCallback(
    (userId: string) => payments.filter(p => p.userId === userId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    [payments]
  );

  const value = useMemo(
    () => ({
      payments,
      addPayment,
      getPaymentsForUser,
    }),
    [payments, addPayment, getPaymentsForUser]
  );

  return <PaymentsContext.Provider value={value}>{children}</PaymentsContext.Provider>;
}

export function usePayments() {
  const ctx = useContext(PaymentsContext);
  if (!ctx) throw new Error('usePayments must be used within PaymentsProvider');
  return ctx;
}
