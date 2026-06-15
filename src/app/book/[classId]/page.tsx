'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

import { CheckoutPageUI } from '@/components/booking/checkout-page-ui';
import { PageHeader } from '@/components/layout/page-header';
import { useClasses } from '@/contexts/classes-context';
import { useBookings } from '@/contexts/bookings-context';
import { useAuth } from '@/contexts/auth-context';
import { ApiClientError } from '@/services/api-client';
import { apiGetClassBookingPaymentOptions, apiGetPaymentsConfig } from '@/services/api';
import {
  buildCreateBookingRequest,
  findPaymentOption,
} from '@/utils/booking-payments';
import { BUTTON_LABELS, SCREEN_TITLES, GENERAL_LABELS } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';
import type { BillingPeriod, ClassBookingPaymentOptions, ClassListItem, PaymentModel } from '@/types/api';

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
  const { getClassById, fetchClassById } = useClasses();
  const { createBooking } = useBookings();
  const { user } = useAuth();
  const waitlistEnabled = useFeature('waitlist');
  const subscriptionModelsEnabled = useFeature('subscriptionPaymentModels');
  const [cls, setCls] = useState<ClassListItem | undefined>(() =>
    classId ? getClassById(classId) : undefined,
  );
  const [paymentOptions, setPaymentOptions] = useState<ClassBookingPaymentOptions | null>(null);
  const [paymentModel, setPaymentModel] = useState<PaymentModel>('per_class');
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod | undefined>();
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);
  const [error, setError] = useState('');
  const isWaitlist = searchParams.get('waitlist') === '1' && waitlistEnabled;

  useEffect(() => {
    if (searchParams.get('waitlist') === '1' && !waitlistEnabled) {
      router.replace(`/book/${classId}`);
    }
  }, [searchParams, waitlistEnabled, classId, router]);

  useEffect(() => {
    apiGetPaymentsConfig()
      .then((cfg) => setPaymentsEnabled(cfg.enabled))
      .catch(() => setPaymentsEnabled(false));
  }, []);

  useEffect(() => {
    if (!classId) return;
    let cancelled = false;

    async function loadClass() {
      const cached = getClassById(classId);
      const classData = cached ?? (await fetchClassById(classId));
      if (cancelled || !classData) return;
      setCls(classData);
      setOptionsLoading(true);
      try {
        const options = await apiGetClassBookingPaymentOptions(classData);
        if (!cancelled) {
          setPaymentOptions(options);
          const defaultOption = options.options[0];
          if (defaultOption) {
            setPaymentModel(defaultOption.paymentModel);
            setBillingPeriod(defaultOption.billingPeriod);
          }
        }
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    }

    loadClass();
    return () => {
      cancelled = true;
    };
  }, [classId, fetchClassById, getClassById]);

  const selectedOption = useMemo(() => {
    if (!paymentOptions) return null;
    return findPaymentOption(paymentOptions, paymentModel, billingPeriod);
  }, [paymentOptions, paymentModel, billingPeriod]);

  const checkoutTotal = selectedOption?.coveredBySubscription
    ? cls?.price
    : selectedOption?.price ?? cls?.price;

  const handleSelectPayment = (model: PaymentModel, period?: BillingPeriod) => {
    setPaymentModel(model);
    setBillingPeriod(model === 'per_period' ? period : undefined);
    setError('');
  };

  if (!cls) {
    return (
      <div className="fn-layout-narrow px-6 py-12">
        <PageHeader title={GENERAL_LABELS.book} showBack />
        <p>{SCREEN_TITLES.classNotFound}</p>
      </div>
    );
  }

  const confirm = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (isWaitlist) return;

    if (subscriptionModelsEnabled && paymentModel === 'per_period' && !billingPeriod) {
      setError('Elegí un período de pago (semanal, mensual o trimestral).');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const body = subscriptionModelsEnabled
        ? buildCreateBookingRequest(cls.id, paymentModel, billingPeriod)
        : buildCreateBookingRequest(cls.id, 'per_class');

      const result = await createBooking(body);
      if (result.checkoutUrl && paymentsEnabled && !selectedOption?.coveredBySubscription) {
        window.location.href = result.checkoutUrl;
        return;
      }
      router.push('/athlete/bookings');
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'No se pudo completar la reserva');
    } finally {
      setLoading(false);
    }
  };

  const confirmLabel = isWaitlist
    ? BUTTON_LABELS.joinWaitlistShort
    : selectedOption?.coveredBySubscription
      ? BUTTON_LABELS.confirmBooking
      : paymentsEnabled
        ? BUTTON_LABELS.payAndConfirm
        : BUTTON_LABELS.confirmBooking;

  const pageTitle = isWaitlist ? BUTTON_LABELS.joinWaitlistShort : BUTTON_LABELS.confirmBooking;

  return (
    <CheckoutPageUI
      title={pageTitle}
      cls={cls}
      isWaitlist={isWaitlist}
      subscriptionModelsEnabled={subscriptionModelsEnabled}
      optionsLoading={optionsLoading}
      paymentOptions={paymentOptions}
      paymentModel={paymentModel}
      billingPeriod={billingPeriod}
      onSelectPayment={handleSelectPayment}
      selectedOptionCovered={selectedOption?.coveredBySubscription}
      checkoutTotal={checkoutTotal}
      paymentsEnabled={paymentsEnabled}
      error={error}
      loading={loading}
      confirmLabel={confirmLabel}
      onConfirm={confirm}
    />
  );
}
