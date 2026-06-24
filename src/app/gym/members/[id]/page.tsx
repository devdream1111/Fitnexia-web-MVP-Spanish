'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import {
  ClubInfoNote,
  ClubMemberDetailCard,
  ClubMemberEditForm,
} from '@/components/gym/club-members-ui';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import {
  apiFindClubMember,
  apiGetGymSubscription,
  apiListClubMembershipPlans,
  apiMarkClubMemberPaid,
  apiMarkClubMemberPending,
  apiRemoveClubMember,
  apiUpdateClubMember,
} from '@/services/api';
import { ApiClientError } from '@/services/api-client';
import { ALERT_LABELS, CLUB_LABELS, GENERAL_LABELS } from '@/constants/labels';
import type { ClubMember, ClubMembershipPlan, GymSubscription } from '@/types/api';
import { formatClubMemberName, normalizePlanList, normalizeUpdatedClubMember } from '@/utils/club-members';

export default function GymMemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showNotice } = useNoticeModal();
  const [member, setMember] = useState<ClubMember | null>(null);
  const [plans, setPlans] = useState<ClubMembershipPlan[]>([]);
  const [subscription, setSubscription] = useState<GymSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [paymentBusy, setPaymentBusy] = useState<'paid' | 'pending' | null>(null);
  const [editPlanId, setEditPlanId] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editFirst, setEditFirst] = useState('');
  const [editLast, setEditLast] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const resetEditFields = useCallback((m: ClubMember) => {
    setEditPlanId(m.planId);
    setEditEmail(m.email);
    setEditFirst(m.firstName);
    setEditLast(m.lastName);
    setEditPhone(m.phone ?? '');
  }, []);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [found, plansRes, sub] = await Promise.all([
        apiFindClubMember(id),
        apiListClubMembershipPlans(),
        apiGetGymSubscription().catch(() => null),
      ]);
      setMember(found);
      setPlans(normalizePlanList(plansRes));
      setSubscription(sub);
      if (found) resetEditFields(found);
    } catch {
      setMember(null);
    } finally {
      setLoading(false);
    }
  }, [id, resetEditFields]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    if (!member || !editPlanId || !editFirst.trim() || !editLast.trim() || !editEmail.trim()) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: 'Completá los campos obligatorios.',
        variant: 'error',
      });
      return;
    }

    setSaving(true);
    try {
      const raw = await apiUpdateClubMember(member.id, {
        firstName: editFirst.trim(),
        lastName: editLast.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim() || undefined,
        planId: editPlanId,
      });
      const updated = normalizeUpdatedClubMember(raw);
      if (updated) {
        setMember(updated);
        resetEditFields(updated);
      } else {
        await load();
      }
      setEditing(false);
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: CLUB_LABELS.members.editSaved,
        variant: 'success',
      });
    } catch (error) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: error instanceof ApiClientError ? error.message : 'No se pudo actualizar el socio',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!member) return;
    setPaymentBusy('paid');
    try {
      const updated = await apiMarkClubMemberPaid(member.id);
      setMember(updated);
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: CLUB_LABELS.members.markPaidSuccess,
        variant: 'success',
      });
    } catch (error) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: error instanceof ApiClientError ? error.message : 'No se pudo registrar el pago',
        variant: 'error',
      });
    } finally {
      setPaymentBusy(null);
    }
  };

  const handleMarkPending = async () => {
    if (!member) return;
    setPaymentBusy('pending');
    try {
      const updated = await apiMarkClubMemberPending(member.id);
      setMember(updated);
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: CLUB_LABELS.members.markPendingSuccess,
        variant: 'success',
      });
    } catch (error) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: error instanceof ApiClientError ? error.message : 'No se pudo actualizar el estado',
        variant: 'error',
      });
    } finally {
      setPaymentBusy(null);
    }
  };

  const handleDeactivate = async () => {
    if (!member || !window.confirm(CLUB_LABELS.members.deactivateConfirm)) return;
    setDeactivating(true);
    try {
      await apiRemoveClubMember(member.id);
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: CLUB_LABELS.members.deactivated,
        variant: 'success',
      });
      router.push('/gym/members');
    } catch (error) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: error instanceof ApiClientError ? error.message : 'No se pudo dar de baja',
        variant: 'error',
      });
    } finally {
      setDeactivating(false);
    }
  };

  if (loading) {
    return <p className="p-6 text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>;
  }

  if (!member) {
    return (
      <div className="space-y-4 p-6">
        <PageHeader title="Socio" showBack />
        <p className="text-[var(--fn-text-muted)]">{GENERAL_LABELS.notFound}</p>
      </div>
    );
  }

  const showManualPayments = subscription?.entitlements.manualPayments !== false;

  return (
    <div className="space-y-6">
      <PageHeader title={formatClubMemberName(member)} showBack />
      <div className="flex flex-wrap gap-2">
        {!editing ? (
          <Button title={CLUB_LABELS.members.edit} variant="outline" onClick={() => setEditing(true)} />
        ) : null}
        {showManualPayments && !editing ? (
          <>
            <Button
              title={CLUB_LABELS.members.markPaid}
              loading={paymentBusy === 'paid'}
              onClick={handleMarkPaid}
            />
            <Button
              title={CLUB_LABELS.members.markPending}
              variant="secondary"
              loading={paymentBusy === 'pending'}
              onClick={handleMarkPending}
            />
          </>
        ) : null}
        <Button
          title="Baja"
          variant="ghost"
          loading={deactivating}
          className="text-[var(--fn-error)] hover:bg-red-500/10"
          onClick={handleDeactivate}
        />
      </div>

      {editing && plans.length > 0 ? (
        <ClubMemberEditForm
          plans={plans}
          planId={editPlanId}
          onPlanChange={setEditPlanId}
          email={editEmail}
          onEmailChange={setEditEmail}
          firstName={editFirst}
          onFirstNameChange={setEditFirst}
          lastName={editLast}
          onLastNameChange={setEditLast}
          phone={editPhone}
          onPhoneChange={setEditPhone}
          onSubmit={handleSave}
          onCancel={() => {
            resetEditFields(member);
            setEditing(false);
          }}
          loading={saving}
        />
      ) : (
        <ClubMemberDetailCard member={member} />
      )}

      {showManualPayments ? (
        <ClubInfoNote>{CLUB_LABELS.members.billingNote}</ClubInfoNote>
      ) : null}
    </div>
  );
}
