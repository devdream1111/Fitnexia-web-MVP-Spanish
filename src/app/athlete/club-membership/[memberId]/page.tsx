'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Receipt } from 'lucide-react';

import {
  ClubAlertBanner,
  ClubFeeStatusBadge,
  ClubSection,
} from '@/components/gym/club-members-ui';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import {
  apiAuthorizeMembership,
  apiGetMembershipStatement,
  apiSyncMembershipPayment,
} from '@/services/api';
import { ApiClientError } from '@/services/api-client';
import type { ClubMembershipStatement } from '@/types/api';
import { ALERT_LABELS, CLUB_LABELS, GENERAL_LABELS, SCREEN_TITLES } from '@/constants/labels';
import { clubPlanCadenceLabel } from '@/utils/club-members';
import { formatClassDate, formatMoney } from '@/utils/format';

export default function AthleteClubStatementPage() {
  return (
    <Suspense fallback={<p className="p-6 text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>}>
      <AthleteClubStatementContent />
    </Suspense>
  );
}

function AthleteClubStatementContent() {
  const { memberId } = useParams<{ memberId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showNotice } = useNoticeModal();
  const [statement, setStatement] = useState<ClubMembershipStatement | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'authorize' | null>(null);

  const load = useCallback(async () => {
    if (!memberId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const data = await apiGetMembershipStatement(memberId);
      setStatement(data);
    } catch (error) {
      setStatement(null);
      setLoadError(
        error instanceof ApiClientError ? error.message : GENERAL_LABELS.somethingWentWrong,
      );
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (searchParams.get('sync') !== '1' || !memberId) return;
    const paymentId = searchParams.get('paymentId');
    if (paymentId) {
      apiSyncMembershipPayment(memberId, paymentId)
        .then(() => load())
        .catch(() => load());
      return;
    }
    load();
  }, [searchParams, memberId, load]);

  const redirectIfCheckout = (url?: string) => {
    if (url) {
      window.location.href = url;
      return true;
    }
    return false;
  };

  const handleAuthorize = async () => {
    if (!memberId) return;
    setBusy('authorize');
    try {
      const res = await apiAuthorizeMembership(memberId);
      if (redirectIfCheckout(res.checkoutUrl ?? res.authorizationUrl)) return;
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: CLUB_LABELS.billing.subscriptionActive,
        variant: 'success',
      });
      await load();
    } catch (error) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: error instanceof ApiClientError ? error.message : 'No se pudo autorizar',
        variant: 'error',
      });
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return <p className="p-6 text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>;
  }

  if (!statement) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <PageHeader title={SCREEN_TITLES.clubMembershipStatement} showBack />
        {loadError ? <ClubAlertBanner>{loadError}</ClubAlertBanner> : null}
        <p className="text-[var(--fn-text-muted)]">{GENERAL_LABELS.notFound}</p>
        <Button title={GENERAL_LABELS.back} onClick={() => router.push('/athlete/club-membership')} />
      </div>
    );
  }

  const needsAuthorize =
    statement.subscriptionStatus === 'none' ||
    statement.subscriptionStatus === 'cancelled' ||
    statement.feeStatus === 'pending';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title={statement.institutionName} showBack />

      <article className="relative overflow-hidden rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--fn-primary)]/10 via-transparent to-transparent" />
        <div className="relative space-y-4 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <ClubFeeStatusBadge status={statement.feeStatus} />
            <span className="text-sm text-[var(--fn-text-muted)]">
              {statement.plan.name} · {clubPlanCadenceLabel(statement.plan.cadence)}
            </span>
          </div>
          <p className="text-3xl font-black tracking-tight text-[var(--fn-primary)]">
            {formatMoney(statement.plan.price)}
          </p>
          {statement.nextDueAt ? (
            <p className="text-sm font-medium">
              {CLUB_LABELS.athlete.nextDue}: {formatClassDate(statement.nextDueAt)}
            </p>
          ) : null}
          {statement.balanceDue && statement.balanceDue.amount > 0 ? (
            <p className="rounded-xl bg-red-500/10 px-4 py-2 text-sm font-semibold text-[var(--fn-error)]">
              {CLUB_LABELS.athlete.balanceDue}: {formatMoney(statement.balanceDue)}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-1">
            {needsAuthorize ? (
              <Button
                title={CLUB_LABELS.billing.authorize}
                onClick={handleAuthorize}
                loading={busy === 'authorize'}
              />
            ) : null}
          </div>
          {needsAuthorize ? (
            <p className="text-xs leading-relaxed text-[var(--fn-text-muted)]">
              {CLUB_LABELS.billing.subscribeHint}
            </p>
          ) : null}
        </div>
      </article>

      <ClubSection title={CLUB_LABELS.athlete.chargeHistory} icon={Receipt}>
        {statement.charges.length === 0 ? (
          <p className="text-[var(--fn-text-muted)]">{CLUB_LABELS.athlete.noCharges}</p>
        ) : (
          <div className="space-y-3">
            {statement.charges.map((ch) => (
              <article
                key={ch.id}
                className="flex items-center justify-between rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/40 px-4 py-3"
              >
                <div>
                  <p className="font-bold text-[var(--fn-text)]">{formatMoney(ch.amount)}</p>
                  <p className="text-xs text-[var(--fn-text-muted)]">
                    {formatClassDate(ch.periodStart)} – {formatClassDate(ch.periodEnd)} · {ch.status}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </ClubSection>
    </div>
  );
}
