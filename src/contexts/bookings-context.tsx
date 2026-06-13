'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAuth } from '@/contexts/auth-context';
import {
  apiCancelBooking,
  apiCreateBooking,
  apiGetMyBookings,
  apiSyncBookingPayment,
  type BookingRecord,
} from '@/services/api';
import type { CreateBookingRequest } from '@/types/api';

interface BookingsContextValue {
  bookings: BookingRecord[];
  loading: boolean;
  error: string | null;
  refreshBookings: () => Promise<void>;
  createBooking: (body: CreateBookingRequest) => Promise<BookingRecord>;
  cancelBooking: (bookingId: string) => Promise<BookingRecord>;
  syncPayment: (bookingId: string) => Promise<BookingRecord>;
  getUserBookings: (userId: string) => BookingRecord[];
}

const BookingsContext = createContext<BookingsContextValue | null>(null);

export function BookingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBookings = useCallback(async () => {
    if (!user || user.role !== 'athlete') {
      setBookings([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiGetMyBookings();
      setBookings(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'athlete') {
      refreshBookings();
    } else {
      setBookings([]);
    }
  }, [user?.id, user?.role, refreshBookings]);

  const createBooking = useCallback(async (body: CreateBookingRequest) => {
    const result = await apiCreateBooking(body);
    const record: BookingRecord = {
      ...result.booking,
      checkoutUrl: result.payment?.checkoutUrl,
    };
    setBookings((prev) => [record, ...prev]);
    return record;
  }, []);

  const cancelBooking = useCallback(async (bookingId: string) => {
    const updated = await apiCancelBooking(bookingId);
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));
    return updated;
  }, []);

  const syncPayment = useCallback(async (bookingId: string) => {
    const updated = await apiSyncBookingPayment(bookingId);
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));
    return updated;
  }, []);

  const getUserBookings = useCallback(
    (userId: string) => bookings.filter((b) => b.userId === userId),
    [bookings],
  );

  const value = useMemo(
    () => ({
      bookings,
      loading,
      error,
      refreshBookings,
      createBooking,
      cancelBooking,
      syncPayment,
      getUserBookings,
    }),
    [
      bookings,
      loading,
      error,
      refreshBookings,
      createBooking,
      cancelBooking,
      syncPayment,
      getUserBookings,
    ],
  );

  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>;
}

export function useBookings() {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error('useBookings must be used within BookingsProvider');
  return ctx;
}
