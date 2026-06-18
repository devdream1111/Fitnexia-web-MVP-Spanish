'use client';

import { useCallback, useEffect, useState } from 'react';
import { Mail, Upload, UserPlus } from 'lucide-react';

import {
  ClubAlertBanner,
  ClubEmptyState,
  ClubInviteRow,
  ClubInvitesHero,
  ClubSection,
} from '@/components/gym/club-members-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import {
  apiBulkCreateMembershipInvites,
  apiCancelMembershipInvite,
  apiCreateClubMember,
  apiCreateMembershipInvite,
  apiListMembershipInvites,
  apiListClubMembershipPlans,
} from '@/services/api';
import { ApiClientError } from '@/services/api-client';
import { ALERT_LABELS, CLUB_LABELS, GENERAL_LABELS } from '@/constants/labels';
import type { ClubMemberInvite, ClubMembershipPlan } from '@/types/api';
import { clubPlanCadenceLabel, normalizeInviteList, normalizePlanList } from '@/utils/club-members';

export default function GymMemberInvitesPage() {
  const { showNotice } = useNoticeModal();
  const [plans, setPlans] = useState<ClubMembershipPlan[]>([]);
  const [invites, setInvites] = useState<ClubMemberInvite[]>([]);
  const [planId, setPlanId] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [importing, setImporting] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [manualFirst, setManualFirst] = useState('');
  const [manualLast, setManualLast] = useState('');
  const [manualPhone, setManualPhone] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const errors: string[] = [];

    const [plansResult, invitesResult] = await Promise.allSettled([
      apiListClubMembershipPlans(),
      apiListMembershipInvites(),
    ]);

    if (plansResult.status === 'fulfilled') {
      const list = normalizePlanList(plansResult.value);
      setPlans(list);
      setPlanId((current) => current || list[0]?.id || '');
    } else {
      setPlans([]);
      errors.push(
        plansResult.reason instanceof ApiClientError
          ? plansResult.reason.message
          : CLUB_LABELS.plans.empty,
      );
    }

    if (invitesResult.status === 'fulfilled') {
      setInvites(normalizeInviteList(invitesResult.value));
    } else {
      setInvites([]);
      errors.push(
        invitesResult.reason instanceof ApiClientError
          ? invitesResult.reason.message
          : CLUB_LABELS.invites.loadError,
      );
    }

    setLoadError(errors[0] ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const planOptions = plans.map((p) => ({
    value: p.id,
    label: `${p.name} (${clubPlanCadenceLabel(p.cadence)})`,
  }));

  const handleInvite = async () => {
    if (!planId) return;
    setSending(true);
    try {
      if (email.trim()) {
        await apiCreateMembershipInvite({
          email: email.trim(),
          planId,
          message: message || undefined,
        });
      } else if (manualFirst.trim() && manualLast.trim()) {
        await apiCreateClubMember({
          email: email.trim() || `${manualFirst.toLowerCase().replace(/\s+/g, '.')}@socio.local`,
          firstName: manualFirst.trim(),
          lastName: manualLast.trim(),
          phone: manualPhone || undefined,
          planId,
        });
      } else {
        return;
      }
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: CLUB_LABELS.invites.sent,
        variant: 'success',
      });
      setEmail('');
      setManualFirst('');
      setManualLast('');
      setManualPhone('');
      setMessage('');
      await load();
    } catch (error) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: error instanceof ApiClientError ? error.message : 'No se pudo enviar',
        variant: 'error',
      });
    } finally {
      setSending(false);
    }
  };

  const handleCreateLink = async () => {
    if (!planId) return;
    setSending(true);
    try {
      const invite = await apiCreateMembershipInvite({ planId, message: message || undefined });
      const url =
        invite.inviteUrl ??
        `${typeof window !== 'undefined' ? window.location.origin : ''}/join-club/${invite.code}`;
      await navigator.clipboard.writeText(url);
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: CLUB_LABELS.invites.linkCreated,
        variant: 'success',
      });
      await load();
    } catch (error) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: error instanceof ApiClientError ? error.message : 'No se pudo crear el link',
        variant: 'error',
      });
    } finally {
      setSending(false);
    }
  };

  const handleCsv = async (file: File) => {
    setImporting(true);
    try {
      const res = await apiBulkCreateMembershipInvites(file);
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: CLUB_LABELS.invites.importResult(res.imported, res.failed),
        variant: res.failed > 0 ? 'info' : 'success',
      });
      await load();
    } catch (error) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: error instanceof ApiClientError ? error.message : 'Error al importar',
        variant: 'error',
      });
    } finally {
      setImporting(false);
    }
  };

  const copyInviteLink = (invite: ClubMemberInvite) => {
    const url =
      invite.inviteUrl ??
      `${typeof window !== 'undefined' ? window.location.origin : ''}/join-club/${invite.code}`;
    navigator.clipboard.writeText(url);
    showNotice({
      title: ALERT_LABELS.savedTitle,
      message: CLUB_LABELS.invites.copied,
      variant: 'success',
    });
  };

  const handleCancelInvite = async (id: string) => {
    if (!window.confirm(CLUB_LABELS.invites.cancel + '?')) return;
    setCancellingId(id);
    try {
      await apiCancelMembershipInvite(id);
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: CLUB_LABELS.invites.cancelled,
        variant: 'success',
      });
      await load();
    } catch (error) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: error instanceof ApiClientError ? error.message : 'No se pudo cancelar',
        variant: 'error',
      });
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <ClubInvitesHero />

      {loadError ? <ClubAlertBanner>{loadError}</ClubAlertBanner> : null}

      {loading ? (
        <p className="text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
      ) : plans.length === 0 ? (
        <ClubEmptyState title={CLUB_LABELS.plans.empty} icon={UserPlus} />
      ) : (
        <>
          <ClubSection title={CLUB_LABELS.members.add} icon={Mail}>
            <Select
              label={CLUB_LABELS.invites.plan}
              value={planId}
              onChange={setPlanId}
              options={planOptions}
            />
            <Input
              label={CLUB_LABELS.invites.email}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nombre" value={manualFirst} onChange={(e) => setManualFirst(e.target.value)} />
              <Input label="Apellido" value={manualLast} onChange={(e) => setManualLast(e.target.value)} />
            </div>
            <Input label="Teléfono" value={manualPhone} onChange={(e) => setManualPhone(e.target.value)} />
            <Input
              label={CLUB_LABELS.invites.message}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex flex-wrap gap-2 pt-1">
              <Button title={CLUB_LABELS.invites.send} onClick={handleInvite} loading={sending} />
              <Button
                title={CLUB_LABELS.invites.createLink}
                variant="outline"
                onClick={handleCreateLink}
                loading={sending}
              />
            </div>
          </ClubSection>

          <ClubSection title={CLUB_LABELS.invites.csvTitle} subtitle={CLUB_LABELS.invites.csvHint} icon={Upload}>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/40 px-6 py-10 text-center transition hover:border-[var(--fn-primary)]/40 hover:bg-[var(--fn-primary-muted)]/20">
              <Upload size={28} className="mb-3 text-[var(--fn-primary)]" />
              <span className="text-sm font-semibold text-[var(--fn-text)]">
                {importing ? GENERAL_LABELS.loading : CLUB_LABELS.invites.upload}
              </span>
              <span className="mt-1 text-xs text-[var(--fn-text-muted)]">.csv</span>
              <input
                type="file"
                accept=".csv,text/csv"
                disabled={importing}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleCsv(file);
                }}
                className="sr-only"
              />
            </label>
          </ClubSection>

          {invites.length > 0 ? (
            <ClubSection title={CLUB_LABELS.invites.pending} icon={UserPlus}>
              <div className="-mx-6 -mb-6 overflow-hidden rounded-b-3xl border-t border-[var(--fn-border)]">
                {invites.map((inv) => (
                  <ClubInviteRow
                    key={inv.id}
                    invite={inv}
                    busy={cancellingId === inv.id}
                    onCopy={copyInviteLink}
                    onCancel={handleCancelInvite}
                  />
                ))}
              </div>
            </ClubSection>
          ) : null}
        </>
      )}
    </div>
  );
}
