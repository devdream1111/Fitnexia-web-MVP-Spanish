'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { useClasses } from '@/contexts/classes-context';
import { formatMoney } from '@/data/mock';
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
  const waitlistEnabled = useFeature('waitlist');
  const integratedPayments = useFeature('integratedPayments');
  const cls = getClassById(classId ?? '');
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(
        isWaitlist
          ? 'On waitlist — we will notify you when a spot opens.'
          : integratedPayments
            ? 'Payment mock successful. Check your bookings.'
            : 'Your spot is reserved (mock).',
      );
      router.push('/athlete/bookings');
    }, 800);
  };

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <PageHeader
        title={isWaitlist ? BUTTON_LABELS.joinWaitlistShort : BUTTON_LABELS.confirmBooking}
        showBack
      />
      <div className="rounded-2xl bg-[var(--fn-surface)] p-4">
        <p className="text-xl font-bold">{cls.title}</p>
        <p className="text-sm text-[var(--fn-text-muted)]">{cls.instructor.displayName}</p>
        {!isWaitlist ? <p className="mt-4 text-2xl font-extrabold text-[var(--fn-primary)]">{formatMoney(cls.price)}</p> : null}
      </div>
      {!integratedPayments && !isWaitlist ? (
        <p className="mt-4 text-sm text-[var(--fn-text-muted)]">
          Payment integration is coming soon. This booking is confirmed locally for demo purposes.
        </p>
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
        className="mt-8"
        onClick={confirm}
      />
    </div>
  );
}
