'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { useClasses } from '@/contexts/classes-context';
import { useBookings } from '@/contexts/bookings-context';
import { useAuth } from '@/contexts/auth-context';
import { usePayments } from '@/contexts/payments-context';
import { useNotifications } from '@/contexts/notifications-context';
import { formatMoney, createMercadoPagoPreference } from '@/data/mock';
import { BUTTON_LABELS, SCREEN_TITLES } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';

export default function BookPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading…</div>}>
      <BookContent />
    </Suspense>
  );
}

function BookContent() {
  const { classId } = useParams<{ classId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getClassById } = useClasses();
  const { addBooking } = useBookings();
  const { user } = useAuth();
  const { addPayment } = usePayments();
  const { addNotification: addNotificationContext } = useNotifications();
  const waitlistEnabled = useFeature('waitlist');
  const integratedPayments = useFeature('integratedPayments');
  const cls = getClassById(classId ?? '');
  const [loading, setLoading] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const isWaitlist = searchParams.get('waitlist') === '1' && waitlistEnabled;

  useEffect(() => {
    if (searchParams.get('waitlist') === '1' && !waitlistEnabled) {
      router.replace(`/book/${classId}`);
    }
  }, [searchParams, waitlistEnabled, classId, router]);

  if (!cls) {
    return (
      <div className="mx-auto max-w-lg px-6 py-12">
        <PageHeader title="Book" showBack />
        <p>{SCREEN_TITLES.classNotFound}</p>
      </div>
    );
  }

  const confirm = () => {
    if (!user) return;
    
    if (!isWaitlist) {
        setShowPaymentOptions(true);
      } else {
        // Handle waitlist
        setLoading(true);
        setTimeout(() => {
          addNotificationContext({
            type: 'booking_confirmed',
            title: 'Joined Waitlist!',
            body: `You've joined the waitlist for ${cls.title}. We'll notify you if a spot opens up.`,
            read: false,
          });
          setLoading(false);
          alert('On waitlist — we will notify you when a spot opens.');
          router.push('/athlete/bookings');
        }, 1000);
      }
  };

  const completePayment = (paymentMethod: string) => {
    if (!user || !cls) return;
    
    setLoading(true);
    setTimeout(() => {
      // Create booking
      const booking = addBooking({
        status: 'confirmed',
        classId: cls.id,
        userId: user.id,
        price: cls.price,
      });
      
      // Create payment record
      addPayment({
        bookingId: booking.id,
        userId: user.id,
        amount: cls.price,
        status: 'paid',
        paymentMethod,
      });
      
      // Send confirmation notification
      addNotificationContext({
        type: 'booking_confirmed',
        title: 'Booking Confirmed!',
        body: `Your class booking for ${cls.title} has been confirmed.`,
        read: false,
      });
      
      setLoading(false);
      alert('Payment successful! Check your bookings.');
      router.push('/athlete/bookings');
    }, 2000);
  };

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <PageHeader
        title={isWaitlist ? BUTTON_LABELS.joinWaitlistShort : BUTTON_LABELS.confirmBooking}
        showBack
      />
      <div className="rounded-2xl bg-[var(--fn-surface)] p-6 space-y-3">
        <p className="text-xl font-bold">{cls.title}</p>
        <p className="text-sm text-[var(--fn-text-muted)]">{cls.instructor.displayName}</p>
        {!isWaitlist ? (
          <div className="mt-4">
            <p className="text-xs text-[var(--fn-text-muted)]">Total</p>
            <p className="text-3xl font-extrabold text-[var(--fn-primary)]">{formatMoney(cls.price)}</p>
          </div>
        ) : null}
      </div>
      
      {!showPaymentOptions ? (
        <>
          {!integratedPayments && !isWaitlist ? (
            <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-800">
                Payment integration demo: We'll simulate a Mercado Pago checkout.
              </p>
            </div>
          ) : null}
          <Button
            title={
              isWaitlist
                ? BUTTON_LABELS.joinWaitlistShort
                : integratedPayments
                  ? BUTTON_LABELS.payAndConfirm
                  : BUTTON_LABELS.confirmBooking
            }
            loading={loading}
            className="mt-8 w-full"
            onClick={confirm}
          />
        </>
      ) : (
        <div className="mt-6 space-y-4">
          <p className="text-lg font-bold">Select Payment Method</p>
          
          <Button
            title="Mercado Pago"
            className="w-full"
            onClick={() => completePayment('Mercado Pago')}
            loading={loading}
          />
          
          <Button
            title="Credit Card"
            variant="outline"
            className="w-full"
            onClick={() => completePayment('Credit Card')}
            loading={loading}
          />
          
          <Button
            title="Debit Card"
            variant="outline"
            className="w-full"
            onClick={() => completePayment('Debit Card')}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}
