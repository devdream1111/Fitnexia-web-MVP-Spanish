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
import { BUTTON_LABELS, SCREEN_TITLES, GENERAL_LABELS } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';

export default function BookPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">{GENERAL_LABELS.loading}</div>}>
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
      <div className="fn-layout-narrow px-6 py-12">
        <PageHeader title={GENERAL_LABELS.book} showBack />
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
            title: GENERAL_LABELS.joinedWaitlistTitle,
            body: GENERAL_LABELS.joinedWaitlistBody.replace('{classTitle}', cls.title),
            read: false,
          });
          setLoading(false);
          alert(GENERAL_LABELS.onWaitlistAlert);
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
        title: GENERAL_LABELS.bookingConfirmedTitle,
        body: GENERAL_LABELS.bookingConfirmedBody.replace('{classTitle}', cls.title),
        read: false,
        
      });
      
      setLoading(false);
      alert(GENERAL_LABELS.paymentSuccessfulAlert);
      router.push('/athlete/bookings');
    }, 2000);
  };

  return (
    <div className="fn-layout-narrow px-6 py-12">
      <PageHeader
        title={isWaitlist ? BUTTON_LABELS.joinWaitlistShort : BUTTON_LABELS.confirmBooking}
        showBack
      />
      <div className="rounded-2xl bg-[var(--fn-surface)] p-6 space-y-3">
        <p className="text-xl font-bold">{cls.title}</p>
        <p className="text-sm text-[var(--fn-text-muted)]">{cls.instructor.displayName}</p>
        {!isWaitlist ? (
          <div className="mt-4">
            <p className="text-xs text-[var(--fn-text-muted)]">{GENERAL_LABELS.total}</p>
            <p className="text-3xl font-extrabold text-[var(--fn-primary)]">{formatMoney(cls.price)}</p>
          </div>
        ) : null}
      </div>
      
      {!showPaymentOptions ? (
        <>
          {!integratedPayments && !isWaitlist ? (
            <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-800">
                {GENERAL_LABELS.paymentIntegrationDemo}
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
          <p className="text-lg font-bold">{GENERAL_LABELS.selectPaymentMethod}</p>
          
          <Button
            title={GENERAL_LABELS.mercadoPago}
            className="w-full"
            onClick={() => completePayment(GENERAL_LABELS.mercadoPago)}
            loading={loading}
          />
          
          <Button
            title={GENERAL_LABELS.creditCard}
            variant="outline"
            className="w-full"
            onClick={() => completePayment(GENERAL_LABELS.creditCard)}
            loading={loading}
          />
          
          <Button
            title={GENERAL_LABELS.debitCard}
            variant="outline"
            className="w-full"
            onClick={() => completePayment(GENERAL_LABELS.debitCard)}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}
