'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { useClasses } from '@/contexts/classes-context';
import { useBookings } from '@/contexts/bookings-context';
import { useAuth } from '@/contexts/auth-context';
import { ApiClientError } from '@/services/api-client';
import { apiGetPaymentsConfig } from '@/services/api';
import { formatMoney } from '@/utils/format';
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
  const { getClassById, fetchClassById } = useClasses();
  const { createBooking } = useBookings();
  const { user } = useAuth();
  const waitlistEnabled = useFeature('waitlist');
  const [cls, setCls] = useState(getClassById(classId ?? ''));
  const [loading, setLoading] = useState(false);
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);
  const [error, setError] = useState('');
  const isWaitlist = searchParams.get('waitlist') === '1' && waitlistEnabled;

  useEffect(() => {
    if (searchParams.get('waitlist') === '1' && !waitlistEnabled) {
      router.replace(`/book/${classId}`);
    }
  }, [searchParams, waitlistEnabled, classId, router]);

  useEffect(() => {
    apiGetPaymentsConfig().then((cfg) => setPaymentsEnabled(cfg.enabled));
  }, []);

  useEffect(() => {
    if (!classId) return;
    if (cls) return;
    fetchClassById(classId).then((c) => setCls(c ?? undefined));
  }, [classId, cls, fetchClassById]);

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

    setLoading(true);
    setError('');
    try {
      const result = await createBooking(cls.id);
      if (result.checkoutUrl && paymentsEnabled) {
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

      {error ? <p className="mt-4 text-sm text-[var(--fn-error)]">{error}</p> : null}

      {!paymentsEnabled && !isWaitlist ? (
        <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200">
          <p className="text-sm text-blue-800">{GENERAL_LABELS.paymentIntegrationDemo}</p>
        </div>
      ) : null}

      <Button
        title={
          isWaitlist
            ? BUTTON_LABELS.joinWaitlistShort
            : paymentsEnabled
              ? BUTTON_LABELS.payAndConfirm
              : BUTTON_LABELS.confirmBooking
        }
        loading={loading}
        className="mt-8 w-full"
        onClick={confirm}
      />
    </div>
  );
}
