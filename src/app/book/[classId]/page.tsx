'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

import { PaymentModelPicker } from '@/components/booking/payment-model-picker';
import { Button } from '@/components/ui/button';
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
import { formatMoney } from '@/utils/format';
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

  return (
    <div className="fn-layout-narrow px-6 py-12">
      <PageHeader
        title={isWaitlist ? BUTTON_LABELS.joinWaitlistShort : BUTTON_LABELS.confirmBooking}
        showBack
      />
      <div className="rounded-2xl bg-[var(--fn-surface)] p-6 space-y-3">
        <p className="text-xl font-bold">{cls.title}</p>
        <p className="text-sm text-[var(--fn-text-muted)]">{cls.instructor.displayName}</p>
        {!isWaitlist && checkoutTotal ? (
          <div className="mt-4">
            <p className="text-xs text-[var(--fn-text-muted)]">{GENERAL_LABELS.total}</p>
            <p className="text-3xl font-extrabold text-[var(--fn-primary)]">
              {selectedOption?.coveredBySubscription
                ? formatMoney({ amount: 0, currency: checkoutTotal.currency })
                : formatMoney(checkoutTotal)}
            </p>
          </div>
        ) : null}
      </div>

      {!isWaitlist && subscriptionModelsEnabled ? (
        <div className="mt-6 space-y-3">
          <h2 className="text-lg font-bold text-[var(--fn-text)]">
            {GENERAL_LABELS.choosePaymentModel}
          </h2>
          {optionsLoading || !paymentOptions ? (
            <p className="text-sm text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
          ) : (
            <PaymentModelPicker
              options={paymentOptions}
              selectedModel={paymentModel}
              selectedPeriod={billingPeriod}
              onSelect={handleSelectPayment}
              disabled={loading}
            />
          )}
          {selectedOption?.coveredBySubscription ? (
            <p className="rounded-xl border border-[var(--fn-success)]/30 bg-[var(--fn-success-muted)]/40 p-3 text-sm text-[var(--fn-text-secondary)]">
              {GENERAL_LABELS.subscriptionCoversBooking}
            </p>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="mt-4 text-sm text-[var(--fn-error)]">{error}</p> : null}

      {!paymentsEnabled && !isWaitlist && !selectedOption?.coveredBySubscription ? (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">{GENERAL_LABELS.paymentIntegrationDemo}</p>
        </div>
      ) : null}

      <Button
        title={confirmLabel}
        loading={loading}
        className="mt-8 w-full"
        onClick={confirm}
      />
    </div>
  );
}
