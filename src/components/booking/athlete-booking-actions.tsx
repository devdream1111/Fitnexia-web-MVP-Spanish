'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { formatMoney } from '@/utils/format';
import { canCancelBooking, getRefundAmount } from '@/utils/booking';
import { BUTTON_LABELS, GENERAL_LABELS } from '@/constants/labels';
import type { ClassListItem } from '@/types/api';
import type { BookingRecord } from '@/services/api';

type Props = {
  booking: BookingRecord;
  cls: ClassListItem;
  tab: 'upcoming' | 'past';
  payingId: string | null;
  cancellingId: string | null;
  showCancelConfirm: string | null;
  onPay: (booking: BookingRecord) => void;
  onCancel: (bookingId: string) => void;
  onConfirmCancel: (bookingId: string) => void;
  onDismissCancel: () => void;
  showReviewLink?: boolean;
  layout?: 'row' | 'stack';
};

export function AthleteBookingActions({
  booking,
  cls,
  tab,
  payingId,
  cancellingId,
  showCancelConfirm,
  onPay,
  onCancel,
  onConfirmCancel,
  onDismissCancel,
  showReviewLink = false,
  layout = 'row',
}: Props) {
  const policyHours = 24;
  const canCancel =
    ['confirmed', 'pending_payment'].includes(booking.status) &&
    canCancelBooking(cls.startAt, policyHours);
  const refundAmount = getRefundAmount(booking, cls.startAt, policyHours);
  const isUpcomingActive =
    ['confirmed', 'pending_payment'].includes(booking.status) && tab === 'upcoming';
  const actionBusy = payingId === booking.id || cancellingId === booking.id;
  const buttonStack =
    layout === 'stack'
      ? 'flex flex-col gap-2 sm:flex-row sm:flex-wrap'
      : 'flex flex-col gap-2 sm:flex-row sm:justify-end';

  return (
    <>
      {isUpcomingActive ? (
        <div className={buttonStack}>
          {booking.status === 'pending_payment' ? (
            <Button
              title={BUTTON_LABELS.completePayment}
              size="sm"
              loading={payingId === booking.id}
              onClick={() => onPay(booking)}
            />
          ) : null}
          <Button
            title={GENERAL_LABELS.cancel}
            variant="outline"
            size="sm"
            onClick={() => onCancel(booking.id)}
            disabled={actionBusy}
          />
        </div>
      ) : null}

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
              onClick={() => onConfirmCancel(booking.id)}
              loading={cancellingId === booking.id}
            />
            <Button
              title={GENERAL_LABELS.keepBooking}
              variant="outline"
              size="sm"
              onClick={onDismissCancel}
              disabled={cancellingId === booking.id}
            />
          </div>
        </div>
      ) : null}

      {showReviewLink && booking.status === 'completed' ? (
        <div className="mt-4">
          <Link href={`/review/${booking.id}`} className="inline-block">
            <Button title={GENERAL_LABELS.leaveReview} size="sm" variant="outline" />
          </Link>
        </div>
      ) : null}
    </>
  );
}
