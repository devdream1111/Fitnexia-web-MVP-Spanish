'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type { Booking } from '@/types/api';
import { 
  MOCK_BOOKINGS, 
  addBooking as addBookingMock, 
  cancelBooking as cancelBookingMock 
} from '@/data/mock';

interface BookingsContextValue {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Booking;
  cancelBooking: (bookingId: string) => Booking | undefined;
  getUserBookings: (userId: string) => Booking[];
}

const BookingsContext = createContext<BookingsContextValue | null>(null);

export function BookingsProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);

  const addBooking = useCallback(
    (input: Omit<Booking, 'id' | 'createdAt'>) => {
      const created = addBookingMock(input);
      setBookings([...bookings, created]);
      return created;
    },
    [bookings],
  );

  const cancelBooking = useCallback(
    (bookingId: string) => {
      const cancelled = cancelBookingMock(bookingId);
      if (cancelled) {
        setBookings(bookings.map(b => b.id === bookingId ? cancelled : b));
      }
      return cancelled;
    },
    [bookings],
  );

  const getUserBookings = useCallback(
    (userId: string) => bookings.filter(b => b.userId === userId),
    [bookings],
  );

  const value = useMemo(
    () => ({
      bookings,
      addBooking,
      cancelBooking,
      getUserBookings,
    }),
    [bookings, addBooking, cancelBooking, getUserBookings],
  );

  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>;
}

export function useBookings() {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error('useBookings must be used within BookingsProvider');
  return ctx;
}
