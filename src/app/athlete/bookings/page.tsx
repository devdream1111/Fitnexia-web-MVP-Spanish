'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar as CalendarIcon, Clock3, Dumbbell, X } from 'lucide-react';

import { AthleteBookingActions } from '@/components/booking/athlete-booking-actions';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CalendarEventCard } from '@/components/calendar/Calendar';
import { useClasses } from '@/contexts/classes-context';
import { useBookings } from '@/contexts/bookings-context';
import { useAuth } from '@/contexts/auth-context';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import { formatClassDate, formatMoney, isClassOnCalendarDay, parseClassStartAt } from '@/utils/format';
import { formatBookingPaymentLabel } from '@/utils/booking-payments';
import { filterAthleteBookingsByTab } from '@/utils/calendar';
import { ALERT_LABELS, GENERAL_LABELS, INSTRUCTOR_LABELS, MOCK_V2V3_LABELS } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';
import {
  apiConfirmWaitlistSpot,
  apiGetMyWaitlist,
  apiLeaveWaitlist,
  type WaitlistEntry,
} from '@/services/api';
import { ApiClientError } from '@/services/api-client';
import type { ClassListItem } from '@/types/api';
import type { BookingRecord } from '@/services/api';

export default function BookingsPage() {
  const waitlistEnabled = useFeature('waitlist');
  const { getClassById, fetchClassById } = useClasses();
  const { bookings, cancelBooking, syncPayment, refreshBookings } = useBookings();
  const { user } = useAuth();
  const { showNotice } = useNoticeModal();
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistActionId, setWaitlistActionId] = useState<string | null>(null);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showCalendar, setShowCalendar] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);
  const [classCache, setClassCache] = useState<Record<string, ClassListItem>>({});

  useEffect(() => {
    refreshBookings();
  }, [refreshBookings]);

  const refreshWaitlist = useCallback(async () => {
    if (!waitlistEnabled || !user) {
      setWaitlistEntries([]);
      return;
    }
    setWaitlistLoading(true);
    try {
      const { data } = await apiGetMyWaitlist();
      setWaitlistEntries(data);
    } catch {
      setWaitlistEntries([]);
    } finally {
      setWaitlistLoading(false);
    }
  }, [user, waitlistEnabled]);

  useEffect(() => {
    refreshWaitlist();
  }, [refreshWaitlist]);

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

  const userBookings = useMemo(
    () =>
      user ? bookings.filter((b) => b.userId === 'me' || b.userId === user.id) : [],
    [bookings, user],
  );

  const list = useMemo(
    () =>
      filterAthleteBookingsByTab(userBookings, tab, (booking) => resolveClass(booking)?.startAt),
    [userBookings, tab, resolveClass],
  );

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

  const calendarClasses = useMemo(() => {
    const byId = new Map<string, ClassListItem>();
    for (const { cls } of entries) {
      if (!byId.has(cls.id)) byId.set(cls.id, cls);
    }
    return Array.from(byId.values());
  }, [entries]);

  const calendarFocusDate = useMemo(() => {
    const dates = calendarClasses
      .map((c) => parseClassStartAt(c.startAt))
      .filter((d) => !Number.isNaN(d.getTime()));
    if (dates.length === 0) return undefined;
    dates.sort((a, b) => (tab === 'upcoming' ? a.getTime() - b.getTime() : b.getTime() - a.getTime()));
    return dates[0];
  }, [calendarClasses, tab]);

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
      setSelectedDate(null);
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
    setPayingId(booking.id);
    try {
      const updated = await syncPayment(booking.id);
      if (updated.checkoutUrl) window.location.href = updated.checkoutUrl;
    } finally {
      setPayingId(null);
    }
  };

  const getBookingsForDate = (date: Date) => {
    return entries.filter(({ cls }) => isClassOnCalendarDay(cls.startAt, date));
  };

  return (
    <div className="space-y-6 pb-4 md:space-y-8">
      <PageHeader
        variant="premium"
        title={GENERAL_LABELS.myBookings}
        eyebrow={GENERAL_LABELS.athleteBookingsEyebrow}
        subtitle={GENERAL_LABELS.athleteBookingsSubtitle}
        action={
          <button
            type="button"
            onClick={() => setShowCalendar(!showCalendar)}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
              showCalendar
                ? 'bg-[var(--fn-primary)] text-white shadow-md shadow-[color-mix(in_srgb,var(--fn-primary)_35%,transparent)]'
                : 'border border-[var(--fn-border)] bg-[var(--fn-surface)] text-[var(--fn-text-muted)] hover:border-[var(--fn-primary)]/35 hover:text-[var(--fn-text)]'
            }`}
          >
            <CalendarIcon size={16} />
            {showCalendar ? GENERAL_LABELS.hideCalendar : GENERAL_LABELS.showCalendar}
          </button>
        }
      />

      {waitlistEnabled ? (
        <section className="overflow-hidden rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="border-b border-[var(--fn-border)] bg-gradient-to-r from-[var(--fn-primary-muted)]/50 to-transparent px-5 py-4 md:px-6">
            <h2 className="m-0 text-base font-extrabold text-[var(--fn-text)]">
              {MOCK_V2V3_LABELS.waitlistTitle}
            </h2>
          </div>
          <div className="p-5 md:p-6">
            {waitlistLoading ? (
              <p className="text-sm text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
            ) : waitlistEntries.length === 0 ? (
              <p className="text-sm text-[var(--fn-text-muted)]">{MOCK_V2V3_LABELS.waitlistEmpty}</p>
            ) : (
              <ul className="space-y-3">
                {waitlistEntries.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/30 p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-[var(--fn-text)]">
                        {entry.classTitle ?? 'Clase'}
                      </p>
                      <p className="mt-1 text-sm text-[var(--fn-text-muted)]">
                        {entry.classStartAt ? formatClassDate(entry.classStartAt) : '—'} ·{' '}
                        {MOCK_V2V3_LABELS.waitlistPosition(entry.position)}
                      </p>
                      {entry.status === 'spot_offered' ? (
                        <p className="mt-1 text-xs font-medium text-[var(--fn-primary)]">
                          {MOCK_V2V3_LABELS.waitlistSpotOffer}
                          {entry.offerExpiresAt
                            ? ` · Expira ${formatClassDate(entry.offerExpiresAt)}`
                            : ''}
                        </p>
                      ) : null}
                      <div className="mt-2">
                        <Badge
                          label={
                            entry.status === 'spot_offered'
                              ? MOCK_V2V3_LABELS.waitlistStatusOffered
                              : MOCK_V2V3_LABELS.waitlistStatusWaiting
                          }
                          variant={entry.status === 'spot_offered' ? 'success' : 'default'}
                          size="sm"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      {entry.status === 'spot_offered' ? (
                        <Button
                          title={MOCK_V2V3_LABELS.waitlistConfirmSpot}
                          size="sm"
                          loading={waitlistActionId === entry.id}
                          onClick={async () => {
                            setWaitlistActionId(entry.id);
                            try {
                              const result = await apiConfirmWaitlistSpot(entry.id);
                              if (result.payment?.checkoutUrl) {
                                window.location.href = result.payment.checkoutUrl;
                                return;
                              }
                              await refreshBookings();
                              await refreshWaitlist();
                              showNotice({
                                title: ALERT_LABELS.savedTitle,
                                message: GENERAL_LABELS.bookingConfirmedTitle,
                                variant: 'success',
                              });
                            } catch (e) {
                              showNotice({
                                title: ALERT_LABELS.missingInfoTitle,
                                message:
                                  e instanceof ApiClientError
                                    ? e.message
                                    : 'No se pudo confirmar el cupo',
                                variant: 'error',
                              });
                            } finally {
                              setWaitlistActionId(null);
                            }
                          }}
                        />
                      ) : null}
                      <Button
                        title={MOCK_V2V3_LABELS.leaveWaitlist}
                        variant="outline"
                        size="sm"
                        loading={waitlistActionId === entry.id}
                        onClick={async () => {
                          setWaitlistActionId(entry.id);
                          try {
                            await apiLeaveWaitlist(entry.id);
                            await refreshWaitlist();
                          } catch (e) {
                            showNotice({
                              title: ALERT_LABELS.missingInfoTitle,
                              message:
                                e instanceof ApiClientError
                                  ? e.message
                                  : 'No se pudo salir de la lista',
                              variant: 'error',
                            });
                          } finally {
                            setWaitlistActionId(null);
                          }
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ) : null}

      <div className="flex rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/50 p-1.5">
        {(['upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${
              tab === t
                ? 'bg-[var(--fn-surface)] text-[var(--fn-text)] shadow-sm'
                : 'text-[var(--fn-text-muted)] hover:text-[var(--fn-text)]'
            }`}
          >
            {t === 'upcoming' ? GENERAL_LABELS.upcoming : GENERAL_LABELS.history}
          </button>
        ))}
      </div>

      {showCalendar ? (
        <div className="fn-calendar-shell">
          <Calendar
            classes={calendarClasses}
            focusDate={calendarFocusDate}
            onDateClick={(date) => setSelectedDate(date)}
            showSidePanel={false}
            labels={INSTRUCTOR_LABELS.calendar}
          />
        </div>
      ) : null}

      {selectedDate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]">
          <div className="fn-layout-narrow fn-calendar-shell w-full max-h-[85vh] overflow-y-auto shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-[var(--fn-calendar-grid-border)] pb-3">
              <h2 className="m-0 text-lg font-medium capitalize text-[var(--fn-text)]">
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
                className="fn-calendar-icon-btn"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              {getBookingsForDate(selectedDate).length === 0 ? (
                <p className="fn-calendar-side-panel__empty">{GENERAL_LABELS.noBookingsForDay}</p>
              ) : (
                getBookingsForDate(selectedDate).map(({ booking, cls }) => (
                  <CalendarEventCard key={booking.id} item={cls} price={booking.price}>
                    {formatBookingPaymentLabel(booking.paymentModel, booking.billingPeriod) ? (
                      <p className="m-0 text-xs text-[var(--fn-text-muted)]">
                        {formatBookingPaymentLabel(booking.paymentModel, booking.billingPeriod)}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-[var(--fn-text-muted)]">
                      {GENERAL_LABELS.status}: {booking.status}
                    </p>
                    <AthleteBookingActions
                      booking={booking}
                      cls={cls}
                      tab={tab}
                      payingId={payingId}
                      cancellingId={cancellingId}
                      showCancelConfirm={showCancelConfirm}
                      onPay={handlePay}
                      onCancel={handleCancel}
                      onConfirmCancel={confirmCancel}
                      onDismissCancel={() => setShowCancelConfirm(null)}
                      layout="stack"
                    />
                  </CalendarEventCard>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/30 px-6 py-14 text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]">
            <Dumbbell size={22} strokeWidth={2.25} />
          </span>
          <p className="m-0 text-sm text-[var(--fn-text-muted)]">{GENERAL_LABELS.noBookingsInTab}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {entries.map(({ booking, cls }) => (
            <article
              key={booking.id}
              className="flex flex-col overflow-hidden rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--fn-primary)_30%,var(--fn-border))] hover:shadow-[0_16px_36px_-22px_color-mix(in_srgb,var(--fn-primary)_40%,transparent)]"
            >
              <div className="border-b border-[var(--fn-border)] bg-gradient-to-br from-[var(--fn-primary-muted)]/60 to-transparent px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="m-0 text-lg font-extrabold tracking-tight text-[var(--fn-text)]">
                      {cls.title}
                    </p>
                    <p className="mt-1 m-0 inline-flex items-center gap-1.5 text-sm text-[var(--fn-text-muted)]">
                      <Clock3 size={14} strokeWidth={2.4} />
                      {formatClassDate(cls.startAt)}
                    </p>
                  </div>
                  <Badge label={booking.status} size="sm" />
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <p className="m-0 text-xl font-black text-[var(--fn-primary)]">
                  {formatMoney(booking.price)}
                </p>
                {formatBookingPaymentLabel(booking.paymentModel, booking.billingPeriod) ? (
                  <p className="m-0 text-xs text-[var(--fn-text-muted)]">
                    {formatBookingPaymentLabel(booking.paymentModel, booking.billingPeriod)}
                  </p>
                ) : null}
                <div className="mt-auto pt-1">
                  <AthleteBookingActions
                    booking={booking}
                    cls={cls}
                    tab={tab}
                    payingId={payingId}
                    cancellingId={cancellingId}
                    showCancelConfirm={showCancelConfirm}
                    onPay={handlePay}
                    onCancel={handleCancel}
                    onConfirmCancel={confirmCancel}
                    onDismissCancel={() => setShowCancelConfirm(null)}
                    showReviewLink
                    layout="stack"
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
