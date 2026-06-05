'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useClasses } from '@/contexts/classes-context';
import { useBookings } from '@/contexts/bookings-context';
import { useAuth } from '@/contexts/auth-context';
import { useNotifications } from '@/contexts/notifications-context';
import { formatClassDate, formatMoney, canCancelBooking, getRefundAmount } from '@/data/mock';
import type { Booking, ClassListItem } from '@/types/api';

export default function BookingsPage() {
  const { getClassById } = useClasses();
  const { bookings, cancelBooking } = useBookings();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);

  const userBookings = user ? bookings.filter(b => b.userId === user.id) : [];
  
  const list = tab === 'upcoming'
    ? userBookings.filter((b) => b.status === 'confirmed')
    : userBookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');

  const entries = useMemo(() => {
    return list
      .map((booking) => {
        const cls = getClassById(booking.classId);
        if (!cls) return null;
        return { booking, cls };
      })
      .filter((e): e is { booking: Booking; cls: ClassListItem } => e !== null);
  }, [list, getClassById]);

  const handleCancel = (bookingId: string) => {
    setShowCancelConfirm(bookingId);
  };

  const confirmCancel = (bookingId: string) => {
    setCancellingId(bookingId);
    const booking = bookings.find(b => b.id === bookingId);
    const cls = booking ? getClassById(booking.classId) : null;
    
    setTimeout(() => {
      cancelBooking(bookingId);
      
      if (user && booking && cls) {
        addNotification({
          type: 'booking_cancelled',
          title: 'Booking Cancelled',
          body: `Your booking for ${cls.title} has been cancelled. Refund: ${formatMoney(getRefundAmount(booking))}`,
          read: false,
        });
      }
      
      setCancellingId(null);
      setShowCancelConfirm(null);
      alert('Booking cancelled!');
    }, 500);
  };

  return (
    <div>
      <h1 className="mb-4 text-3xl font-extrabold">My Bookings</h1>
      <div className="mb-6 flex rounded-xl bg-[var(--fn-surface-muted)] p-1">
        {(['upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
              tab === t ? 'bg-[var(--fn-surface)] text-[var(--fn-text)] shadow-sm' : 'text-[var(--fn-text-muted)]'
            }`}>
            {t === 'upcoming' ? 'Upcoming' : 'History'}
          </button>
        ))}
      </div>
      {entries.length === 0 ? (
        <p className="text-[var(--fn-text-muted)]">No bookings in this tab.</p>
      ) : (
        entries.map(({ booking, cls }) => {
          const canCancel = canCancelBooking(cls.startAt);
          const refundAmount = getRefundAmount(booking);
          
          return (
            <div
              key={booking.id}
              className="mb-4 rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-lg">{cls.title}</p>
                  <p className="text-sm text-[var(--fn-text-muted)] mt-1">{formatClassDate(cls.startAt)}</p>
                  <p className="mt-2 text-sm">{formatMoney(booking.price)} · {booking.status}</p>
                </div>
                {booking.status === 'confirmed' && tab === 'upcoming' ? (
                  <Button
                    title="Cancel"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancel(booking.id)}
                    loading={cancellingId === booking.id}
                    disabled={!canCancel}
                  />
                ) : null}
              </div>
              
              {showCancelConfirm === booking.id && (
                <div className="mt-4 p-4 rounded-xl border border-red-200 bg-red-50">
                  <p className="font-bold mb-2">Cancel Booking?</p>
                  <p className="text-sm mb-4">
                    {canCancel 
                      ? `You'll receive a full refund of ${formatMoney(refundAmount)}.`
                      : `You're within 24 hours of the class. You'll receive a 50% refund of ${formatMoney(refundAmount)}.`
                    }
                  </p>
                  <div className="flex gap-3">
                    <Button
                      title="Confirm Cancel"
                      variant="danger"
                      size="sm"
                      onClick={() => confirmCancel(booking.id)}
                      loading={cancellingId === booking.id}
                    />
                    <Button
                      title="Keep Booking"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCancelConfirm(null)}
                    />
                  </div>
                </div>
              )}
              
              {booking.status === 'completed' ? (
                <div className="mt-4">
                  <Link href={`/review/${booking.id}`} className="inline-block">
                    <Button title="Leave review" size="sm" variant="outline" />
                  </Link>
                </div>
              ) : null}
            </div>
          );
        })
      )}
    </div>
  );
}
