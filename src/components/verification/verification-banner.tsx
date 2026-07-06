'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { VERIFICATION_LABELS } from '@/constants/labels';
import { apiGetVerificationStatus } from '@/services/api';
import type { VerificationStatus } from '@/types/api';

export function VerificationBanner({
  status,
  rejectionReason,
  verifyHref,
}: {
  status: VerificationStatus;
  rejectionReason?: string;
  verifyHref: string;
}) {
  const [fetchedReason, setFetchedReason] = useState<string | undefined>(rejectionReason);

  useEffect(() => {
    setFetchedReason(rejectionReason);
  }, [rejectionReason]);

  useEffect(() => {
    if (status !== 'rejected' || rejectionReason) return;
    let cancelled = false;
    apiGetVerificationStatus()
      .then((data) => {
        if (!cancelled) {
          setFetchedReason(data.latestRequest?.rejectionReason);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [status, rejectionReason]);

  const reason = fetchedReason;
  if (status === 'verified') {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--fn-success)]/40 bg-[var(--fn-success-muted)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--fn-success)]" />
          <p className="text-sm font-medium text-[var(--fn-text)]">{VERIFICATION_LABELS.bannerVerified}</p>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-sm font-medium text-[var(--fn-text)]">{VERIFICATION_LABELS.bannerPending}</p>
        </div>
        <Link href={verifyHref}>
          <Button variant="outline" size="sm" title={VERIFICATION_LABELS.pageTitle} />
        </Link>
      </div>
    );
  }

  const isRejected = status === 'rejected';
  const message = isRejected ? VERIFICATION_LABELS.bannerRejected : VERIFICATION_LABELS.bannerUnverified;
  const cta = isRejected ? VERIFICATION_LABELS.ctaRetry : VERIFICATION_LABELS.ctaStart;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--fn-primary)]/30 bg-[var(--fn-primary-muted)]/40 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--fn-primary)]" />
        <div>
          <p className="text-sm font-medium text-[var(--fn-text)]">{message}</p>
          {isRejected && reason ? (
            <p className="mt-1 text-sm text-[var(--fn-text-muted)]">
              <span className="font-semibold">{VERIFICATION_LABELS.rejectionReason}:</span> {reason}
            </p>
          ) : null}
        </div>
      </div>
      <Link href={verifyHref}>
        <Button size="sm" title={cta} className="shrink-0" />
      </Link>
    </div>
  );
}
