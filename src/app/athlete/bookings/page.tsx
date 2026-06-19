'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/calendar/Calendar';
import { useClasses } from '@/contexts/classes-context';
import { useBookings } from '@/contexts/bookings-context';
import { useAuth } from '@/contexts/auth-context';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import { formatClassDate, formatMoney, isClassOnCalendarDay, parseClassStartAt } from '@/utils/format';
import { formatBookingPaymentLabel } from '@/utils/booking-payments';
import { canCancelBooking, getRefundAmount } from '@/utils/booking';
import { filterClassesByScheduleTab } from '@/utils/calendar';
import { GENERAL_LABELS } from '@/constants/labels';
import type { ClassListItem } from '@/types/api';
import type { BookingRecord } from '@/services/api';

export default function BookingsPage() {
  const { classes, getClassById, fetchClassById } = useClasses();
  const { bookings, cancelBooking, syncPayment, refreshBookings } = useBookings();
  const { user } = useAuth();
  const { showNotice } = useNoticeModal();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showCalendar, setShowCalendar] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);
  const [classCache, setClassCache] = useState<Record<string, ClassListItem>>({});

  useEffect(() => {
    refreshBookings();
  }, [refreshBookings]);

  const resolveClass = useCallback(
    (booking: BookingRecord): ClassListItem | undefined =>
      booking.class ?? getClassById(booking.classId) ?? classCache[booking.classId],
    [classCache, getClassById],
  );

  useEffect(() => {
    let cancelled = false;
    const missingIds = [
      ...new Set(
        bookings
          .filter((b) => !b.class && !getClassById(b.classId) && !classCache[b.classId])
          .map((b) => b.classId),
      ),
    ];
    if (missingIds.length === 0) return;

    Promise.all(missingIds.map((id) => fetchClassById(id))).then((results) => {
      if (cancelled) return;
      const next: Record<string, ClassListItem> = {};
      results.forEach((cls) => {
        if (cls) next[cls.id] = cls;
      });
      if (Object.keys(next).length > 0) {
        setClassCache((prev) => ({ ...prev, ...next }));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [bookings, classCache, fetchClassById, getClassById]);

  const userBookings = user ? bookings.filter((b) => b.userId === user.id) : [];

  const list = useMemo(() => {
    return userBookings.filter((booking) => {
      const cls = resolveClass(booking);
      if (!cls?.startAt) return false;
      const upcoming = new Date(cls.startAt).getTime() > Date.now();
      if (tab === 'upcoming') {
        return upcoming && ['confirmed', 'pending_payment'].includes(booking.status);
      }
      return (
        !upcoming ||
        ['completed', 'cancelled', 'refunded', 'no_show'].includes(booking.status)
      );
    });
  }, [userBookings, tab, resolveClass]);

  useEffect(() => {
    setSelectedDate(null);
  }, [tab]);

  const entries = useMemo(() => {
    return list
      .map((booking) => {
        const cls = resolveClass(booking);
        if (!cls) return null;
        return { booking, cls };
      })
      .filter((e): e is { booking: BookingRecord; cls: ClassListItem } => e !== null);
  }, [list, resolveClass]);

  const bookedClasses = useMemo(() => {
    const byId = new Map<string, ClassListItem>();
    for (const booking of userBookings) {
      const cls = resolveClass(booking);
      if (cls?.startAt && !byId.has(cls.id)) {
        byId.set(cls.id, cls);
      }
    }
    return filterClassesByScheduleTab(Array.from(byId.values()), tab);
  }, [userBookings, resolveClass, tab]);

  const calendarFocusDate = useMemo(() => {
    const dates = bookedClasses
      .map((c) => parseClassStartAt(c.startAt))
      .filter((d) => !Number.isNaN(d.getTime()));
    if (dates.length === 0) return undefined;
    dates.sort((a, b) => a.getTime() - b.getTime());
    return dates[0];
  }, [bookedClasses]);

  const handleCancel = (bookingId: string) => {
    setShowCancelConfirm(bookingId);
  };

  const confirmCancel = async (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    const cls = booking ? resolveClass(booking) : null;

    setCancellingId(bookingId);
    try {
      await cancelBooking(bookingId);
      setShowCancelConfirm(null);
      if (cls && booking) {
        showNotice({
          title: GENERAL_LABELS.bookingCancelledTitle,
          message: GENERAL_LABELS.bookingCancelledAlert,
          variant: 'success',
        });
      }
    } finally {
      setCancellingId(null);
    }
  };

  const handlePay = async (booking: BookingRecord) => {
    if (booking.checkoutUrl) {
      window.location.href = booking.checkoutUrl;
      return;
    }
    setCancellingId(booking.id);
    try {
      const updated = await syncPayment(booking.id);
      if (updated.checkoutUrl) window.location.href = updated.checkoutUrl;
    } finally {
      setCancellingId(null);
    }
  };

  const getBookingsForDate = (date: Date) => {
    return entries.filter(({ cls }) => isClassOnCalendarDay(cls.startAt, date));
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

      <div className="mb-6 flex rounded-xl bg-[var(--fn-surface-muted)] p-1">
        {(['upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
              tab === t
                ? 'bg-[var(--fn-surface)] text-[var(--fn-text)] shadow-sm'
                : 'text-[var(--fn-text-muted)]'
            }`}
          >
            {t === 'upcoming' ? GENERAL_LABELS.upcoming : GENERAL_LABELS.history}
          </button>
        ))}
      </div>

      {showCalendar ? (
        <div className="mb-8">
          <Calendar
            classes={bookedClasses}
            focusDate={calendarFocusDate}
            onDateClick={(date) => setSelectedDate(date)}
            showSidePanel={false}
          />
        </div>
      ) : null}

      {selectedDate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="fn-layout-narrow w-full rounded-2xl bg-[var(--fn-surface)] p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {selectedDate.toLocaleDateString('es-UY', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
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
                  <div
                    key={booking.id}
                    className="rounded-lg border border-[var(--fn-border)] bg-[var(--fn-surface-muted)] p-4"
                  >
                    <p className="font-semibold text-[var(--fn-text)]">{cls.title}</p>
                  <p className="text-sm text-[var(--fn-text-muted)]">{formatClassDate(cls.startAt)}</p>
                  <p className="text-sm text-[var(--fn-primary)]">{formatMoney(booking.price)}</p>
                  {formatBookingPaymentLabel(booking.paymentModel, booking.billingPeriod) ? (
                    <p className="text-xs text-[var(--fn-text-muted)]">
                      {formatBookingPaymentLabel(booking.paymentModel, booking.billingPeriod)}
                    </p>
                  ) : null}
                    <p className="mt-1 text-xs text-[var(--fn-text-muted)]">
                      {GENERAL_LABELS.status}: {booking.status}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}

      {entries.length === 0 ? (
        <p className="text-[var(--fn-text-muted)]">{GENERAL_LABELS.noBookingsInTab}</p>
      ) : (
        entries.map(({ booking, cls }) => {
          const policyHours = 24;
          const canCancel =
            ['confirmed', 'pending_payment'].includes(booking.status) &&
            canCancelBooking(cls.startAt, policyHours);
          const refundAmount = getRefundAmount(booking, cls.startAt, policyHours);

          return (
            <div
              key={booking.id}
              className="mb-4 rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold">{cls.title}</p>
                  <p className="mt-1 text-sm text-[var(--fn-text-muted)]">{formatClassDate(cls.startAt)}</p>
                  <p className="mt-2 text-sm">
                    {formatMoney(booking.price)} · {booking.status}
                  </p>
                  {formatBookingPaymentLabel(booking.paymentModel, booking.billingPeriod) ? (
                    <p className="mt-1 text-xs text-[var(--fn-text-muted)]">
                      {formatBookingPaymentLabel(booking.paymentModel, booking.billingPeriod)}
                    </p>
                  ) : null}
                </div>
                {['confirmed', 'pending_payment'].includes(booking.status) && tab === 'upcoming' ? (
                  <div className="flex flex-col gap-2">
                    {booking.status === 'pending_payment' ? (
                      <Button
                        title="Completar pago"
                        size="sm"
                        loading={cancellingId === booking.id}
                        onClick={() => handlePay(booking)}
                      />
                    ) : null}
                    <Button
                      title={GENERAL_LABELS.cancel}
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(booking.id)}
                      loading={cancellingId === booking.id}
                      disabled={!canCancel}
                    />
                  </div>
                ) : null}
              </div>

              {showCancelConfirm === booking.id ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/30">
                  <p className="mb-2 font-bold">{GENERAL_LABELS.cancelBooking}</p>
                  <p className="mb-4 text-sm">
                    {canCancel
                      ? GENERAL_LABELS.fullRefund.replace('{amount}', formatMoney(refundAmount))
                      : GENERAL_LABELS.partialRefund.replace('{amount}', formatMoney(refundAmount))}
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
              ) : null}

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
