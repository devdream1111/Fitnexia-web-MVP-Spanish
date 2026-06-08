'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/calendar/Calendar';
import { useClasses } from '@/contexts/classes-context';
import { useBookings } from '@/contexts/bookings-context';
import { useAuth } from '@/contexts/auth-context';
import { useNotifications } from '@/contexts/notifications-context';
import { formatClassDate, formatMoney, canCancelBooking, getRefundAmount } from '@/data/mock';
import { GENERAL_LABELS } from '@/constants/labels';
import type { Booking, ClassListItem } from '@/types/api';

export default function BookingsPage() {
  const { getClassById } = useClasses();
  const { bookings, cancelBooking } = useBookings();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showCalendar, setShowCalendar] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
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

  const bookedClasses = useMemo(() => {
    return userBookings
      .map((booking) => getClassById(booking.classId))
      .filter((c): c is ClassListItem => c !== null);
  }, [userBookings, getClassById]);

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
          title: GENERAL_LABELS.bookingCancelledTitle,
          body: GENERAL_LABELS.bookingCancelledBody.replace('{classTitle}', cls.title).replace('{amount}', formatMoney(getRefundAmount(booking))),
          read: false,
        });
      }
      
      setCancellingId(null);
      setShowCancelConfirm(null);
      alert(GENERAL_LABELS.bookingCancelledAlert);
    }, 500);
  };

  const getBookingsForDate = (date: Date) => {
    return entries.filter(({ cls }) => {
      const clsDate = new Date(cls.startAt);
      return clsDate.toDateString() === date.toDateString();
    });
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">{GENERAL_LABELS.myBookings}</h1>
        <button
          type="button"
          onClick={() => setShowCalendar(!showCalendar)}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
            showCalendar 
              ? 'bg-[var(--fn-primary)] text-white shadow-md' 
              : 'bg-[var(--fn-surface)] text-[var(--fn-text-muted)] hover:bg-[var(--fn-surface-muted)] hover:text-[var(--fn-text)]'
          }`}
        >
          <CalendarIcon size={16} />
          {showCalendar ? GENERAL_LABELS.hideCalendar : GENERAL_LABELS.showCalendar}
        </button>
      </div>

      {showCalendar && (
        <div className="mb-8">
          <Calendar 
            classes={bookedClasses} 
            onDateClick={(date) => setSelectedDate(date)}
            showSidePanel={false}
          />
        </div>
      )}

      {/* Date Modal */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-w-lg w-full rounded-2xl bg-[var(--fn-surface)] p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--fn-surface-muted)] text-[var(--fn-text-muted)] transition-all hover:bg-[var(--fn-border)] hover:text-[var(--fn-text)]"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              {getBookingsForDate(selectedDate).length === 0 ? (
                <p className="text-sm text-[var(--fn-text-muted)]">{GENERAL_LABELS.noBookingsForDay}</p>
              ) : (
                getBookingsForDate(selectedDate).map(({ booking, cls }) => (
                  <div key={booking.id} className="rounded-lg border border-[var(--fn-border)] bg-[var(--fn-surface-muted)] p-4">
                    <p className="font-semibold text-[var(--fn-text)]">{cls.title}</p>
                    <p className="text-sm text-[var(--fn-text-muted)]">{formatClassDate(cls.startAt)}</p>
                    <p className="text-sm text-[var(--fn-primary)]">{formatMoney(booking.price)}</p>
                    <p className="text-xs text-[var(--fn-text-muted)] mt-1">{GENERAL_LABELS.status}: {booking.status}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex rounded-xl bg-[var(--fn-surface-muted)] p-1">
        {(['upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
              tab === t ? 'bg-[var(--fn-surface)] text-[var(--fn-text)] shadow-sm' : 'text-[var(--fn-text-muted)]'
            }`}
          >
            {t === 'upcoming' ? GENERAL_LABELS.upcoming : GENERAL_LABELS.history}
          </button>
        ))}
      </div>
      {entries.length === 0 ? (
        <p className="text-[var(--fn-text-muted)]">{GENERAL_LABELS.noBookingsInTab}</p>
      ) : (
        entries.map(({ booking, cls }) => {
          const canCancel = canCancelBooking(cls.startAt);
          const refundAmount = getRefundAmount(booking);
          
          return (
            <div
              key={booking.id}
              className="mb-4 rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-lg">{cls.title}</p>
                  <p className="text-sm text-[var(--fn-text-muted)] mt-1">{formatClassDate(cls.startAt)}</p>
                  <p className="mt-2 text-sm">{formatMoney(booking.price)} · {booking.status}</p>
                </div>
                {booking.status === 'confirmed' && tab === 'upcoming' ? (
                  <Button
                    title={GENERAL_LABELS.cancel}
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
                  <p className="font-bold mb-2">{GENERAL_LABELS.cancelBooking}</p>
                  <p className="text-sm mb-4">
                    {canCancel
                      ? GENERAL_LABELS.fullRefund.replace('{amount}', formatMoney(refundAmount))
                      : GENERAL_LABELS.partialRefund.replace('{amount}', formatMoney(refundAmount))
                    }
                  </p>
                  <div className="flex gap-3">
                    <Button
                      title={GENERAL_LABELS.confirmCancel}
                      variant="danger"
                      size="sm"
                      onClick={() => confirmCancel(booking.id)}
                      loading={cancellingId === booking.id}
                    />
                    <Button
                      title={GENERAL_LABELS.keepBooking}
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
                    <Button title={GENERAL_LABELS.leaveReview} size="sm" variant="outline" />
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
