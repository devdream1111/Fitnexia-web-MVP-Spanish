'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Building2, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/layout/Logo';
import { useAuth } from '@/contexts/auth-context';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import { apiAcceptMembershipInvite, apiGetMembershipInvitePreview } from '@/services/api';
import { ApiClientError } from '@/services/api-client';
import type { ClubInvitePreview } from '@/types/api';
import { ALERT_LABELS, BUTTON_LABELS, CLUB_LABELS, GENERAL_LABELS } from '@/constants/labels';
import { clubPlanCadenceLabel } from '@/utils/club-members';
import { formatMoney } from '@/utils/format';

export default function JoinClubPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { showNotice } = useNoticeModal();
  const [preview, setPreview] = useState<ClubInvitePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!code) return;
    apiGetMembershipInvitePreview(code)
      .then(setPreview)
      .catch(() => setPreview(null))
      .finally(() => setLoading(false));
  }, [code]);

  const handleAccept = async () => {
    if (!code) return;
    if (!user) {
      router.push(`/auth/login?next=${encodeURIComponent(`/join-club/${code}`)}`);
      return;
    }
    setAccepting(true);
    try {
      const res = await apiAcceptMembershipInvite(code);
      const memberId = res.memberId ?? res.member?.id;
      const redirectUrl = res.checkoutUrl ?? res.authorizationUrl;
      if (redirectUrl) {
        showNotice({
          title: ALERT_LABELS.savedTitle,
          message: CLUB_LABELS.join.redirectPay,
          variant: 'info',
        });
        window.location.href = redirectUrl;
        return;
      }
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: CLUB_LABELS.join.success,
        variant: 'success',
      });
      if (memberId) {
        router.push(`/athlete/club-membership/${memberId}?sync=1`);
      } else {
        router.push('/athlete/club-membership');
      }
    } catch (error) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: error instanceof ApiClientError ? error.message : 'No se pudo aceptar',
        variant: 'error',
      });
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="relative mx-auto flex min-h-[80vh] max-w-lg flex-col justify-center px-6 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute bottom-24 right-0 h-48 w-48 rounded-full bg-blue-500/15 blur-3xl" />
      </div>

      <div className="mb-10 flex justify-center">
        <Logo size="md" />
      </div>

      {loading ? (
        <p className="text-center text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
      ) : !preview?.valid ? (
        <div className="rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-8 text-center shadow-lg">
          <h1 className="text-2xl font-black">{CLUB_LABELS.join.title}</h1>
          <p className="mt-4 text-[var(--fn-text-muted)]">{CLUB_LABELS.join.invalid}</p>
          <Link href="/" className="mt-6 inline-block font-semibold text-[var(--fn-primary)]">
            {GENERAL_LABELS.goBackHome}
          </Link>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-8 shadow-xl">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-blue-600/10" />
          <div className="relative space-y-5">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]">
                <Building2 size={24} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--fn-text-muted)]">
                  Invitación
                </p>
                <h1 className="text-2xl font-black text-[var(--fn-text)]">{CLUB_LABELS.join.title}</h1>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/50 p-5">
              <p className="text-xl font-extrabold text-[var(--fn-primary)]">{preview.institutionName}</p>
              <p className="mt-3 flex items-start gap-2 text-sm text-[var(--fn-text-muted)]">
                <Sparkles size={16} className="mt-0.5 shrink-0 text-[var(--fn-primary)]" />
                <span>
                  {preview.plan.name} ({clubPlanCadenceLabel(preview.plan.cadence)}) ·{' '}
                  {formatMoney(preview.plan.price)}
                </span>
              </p>
            </div>

            {!user ? (
              <p className="text-sm text-[var(--fn-text-muted)]">{CLUB_LABELS.join.loginRequired}</p>
            ) : null}

            <div className="flex flex-col gap-2 pt-1">
              <Button title={CLUB_LABELS.join.accept} onClick={handleAccept} loading={accepting} className="w-full" />
              {!user ? (
                <Link href={`/auth/register?next=${encodeURIComponent(`/join-club/${code}`)}`}>
                  <Button title={BUTTON_LABELS.createAccount} variant="outline" className="w-full" />
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
