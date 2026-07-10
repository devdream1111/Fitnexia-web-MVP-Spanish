'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

import { CheckoutPageUI } from '@/components/booking/checkout-page-ui';
import { DigitalWalletsPanel } from '@/components/mock-v2v3/digital-wallets-panel';
import { LoyaltyCreditsPanel } from '@/components/loyalty/loyalty-credits-panel';
import { PageHeader } from '@/components/layout/page-header';
import { IS_MOCK_V2V3_ENABLED } from '@/config/mock-v2v3';
import { useClasses } from '@/contexts/classes-context';
import { useBookings } from '@/contexts/bookings-context';
import { useAuth } from '@/contexts/auth-context';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import { useFeature } from '@/hooks/use-feature';
import { ApiClientError } from '@/services/api-client';
import {
  apiGetClassBookingPaymentOptions,
  apiGetMyCredits,
  apiGetPaymentsConfig,
  apiJoinClassWaitlist,
} from '@/services/api';
import {
  buildCreateBookingRequest,
  findPaymentOption,
} from '@/utils/booking-payments';
import {
  ALERT_LABELS,
  BUTTON_LABELS,
  MOCK_V2V3_LABELS,
  SCREEN_TITLES,
  GENERAL_LABELS,
} from '@/constants/labels';
import type {
  BillingPeriod,
  ClassBookingPaymentOptions,
  ClassListItem,
  CreditBalance,
  PaymentModel,
} from '@/types/api';

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
  const loyaltyEnabled = useFeature('loyaltyCredits');
  const walletsEnabled = useFeature('digitalWallets');
  const { showNotice } = useNoticeModal();
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
  const [applyCredits, setApplyCredits] = useState(false);
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null);
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
    if (!user || user.role !== 'athlete' || !loyaltyEnabled) {
      setCreditBalance(null);
      return;
    }
    let cancelled = false;
    apiGetMyCredits()
      .then((balance) => {
        if (!cancelled) setCreditBalance(balance);
      })
      .catch(() => {
        if (!cancelled) setCreditBalance(null);
      });
    return () => {
      cancelled = true;
    };
  }, [loyaltyEnabled, user]);

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

  const usingCredits =
    loyaltyEnabled &&
    applyCredits &&
    Boolean(creditBalance?.freeClassEligible) &&
    paymentModel === 'per_class' &&
    !isWaitlist;

  const checkoutTotal = usingCredits
    ? { amount: 0, currency: cls?.price.currency ?? 'UYU' }
    : selectedOption?.coveredBySubscription
      ? cls?.price
      : (selectedOption?.price ?? cls?.price);

  const handleSelectPayment = (model: PaymentModel, period?: BillingPeriod) => {
    setPaymentModel(model);
    setBillingPeriod(model === 'per_period' ? period : undefined);
    if (model !== 'per_class') setApplyCredits(false);
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

    if (isWaitlist) {
      setLoading(true);
      setError('');
      try {
        await apiJoinClassWaitlist(cls.id);
        showNotice({
          title: ALERT_LABELS.savedTitle,
          message: MOCK_V2V3_LABELS.waitlistJoined,
          variant: 'success',
        });
        router.push('/athlete/bookings?tab=waitlist');
      } catch (e) {
        setError(e instanceof ApiClientError ? e.message : 'No se pudo unir a la lista de espera');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (subscriptionModelsEnabled && paymentModel === 'per_period' && !billingPeriod) {
      setError('Elegí un período de pago (semanal, mensual o trimestral).');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const redeemCredits = usingCredits;
      const body = subscriptionModelsEnabled
        ? buildCreateBookingRequest(cls.id, paymentModel, billingPeriod, {
            useCredits: redeemCredits,
          })
        : buildCreateBookingRequest(cls.id, 'per_class', undefined, {
            useCredits: redeemCredits,
          });

      const result = await createBooking(body);
      if (result.loyaltyRedemption || redeemCredits) {
        showNotice({
          title: ALERT_LABELS.savedTitle,
          message: MOCK_V2V3_LABELS.creditsApplied,
          variant: 'success',
        });
        router.push('/athlete/bookings');
        return;
      }
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
    : usingCredits
      ? BUTTON_LABELS.confirmBooking
      : selectedOption?.coveredBySubscription
        ? BUTTON_LABELS.confirmBooking
        : paymentsEnabled
          ? BUTTON_LABELS.payAndConfirm
          : BUTTON_LABELS.confirmBooking;

  const pageTitle = isWaitlist ? BUTTON_LABELS.joinWaitlistShort : BUTTON_LABELS.confirmBooking;

  const checkoutExtras = !isWaitlist ? (
    <>
      {loyaltyEnabled && creditBalance && paymentModel === 'per_class' ? (
        <LoyaltyCreditsPanel
          balance={creditBalance}
          applyCredits={applyCredits}
          onApplyCreditsChange={setApplyCredits}
          classPrice={cls.price}
          disabled={Boolean(selectedOption?.coveredBySubscription)}
        />
      ) : null}
      {walletsEnabled && IS_MOCK_V2V3_ENABLED && !selectedOption?.coveredBySubscription && !usingCredits ? (
        <DigitalWalletsPanel
          disabled={loading}
          onSelect={() => {
            showNotice({
              title: MOCK_V2V3_LABELS.digitalWallets,
              message: MOCK_V2V3_LABELS.walletDemoNote,
              variant: 'info',
            });
          }}
        />
      ) : null}
    </>
  ) : null;

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
      paymentsEnabled={paymentsEnabled && !usingCredits}
      error={error}
      loading={loading}
      confirmLabel={confirmLabel}
      onConfirm={confirm}
      checkoutExtras={checkoutExtras}
    />
  );
}
