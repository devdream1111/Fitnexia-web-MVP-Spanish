'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { GymStaffCard, GymStaffGrid, GymStaffHero } from '@/components/gym/gym-staff-ui';
import { useAuth } from '@/contexts/auth-context';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import {
  apiCancelInstructorInvite,
  apiGetStaffRoster,
  apiInviteInstructor,
  apiUnlinkInstructor,
  type StaffRosterItem,
} from '@/services/api';
import { ApiClientError } from '@/services/api-client';
import { ALERT_LABELS, GENERAL_LABELS, GYM_LABELS } from '@/constants/labels';

export default function GymInstructorsPage() {
  const { user } = useAuth();
  const { showNotice } = useNoticeModal();
  const [roster, setRoster] = useState<StaffRosterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadRoster = useCallback(async () => {
    if (user?.role !== 'institution') return;
    setLoading(true);
    try {
      const res = await apiGetStaffRoster();
      setRoster(res.data);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    loadRoster();
  }, [loadRoster]);

  const linkedCount = useMemo(
    () => roster.filter((r) => r.staffStatus === 'linked').length,
    [roster],
  );
  const pendingCount = useMemo(
    () => roster.filter((r) => r.staffStatus === 'pending').length,
    [roster],
  );

  const handleAdd = async (instructorId: string) => {
    setBusyId(instructorId);
    try {
      await apiInviteInstructor({ instructorId });
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: GYM_LABELS.instructors.inviteSent,
        variant: 'success',
      });
      await loadRoster();
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.code === 'INVITE_EXISTS'
            ? GYM_LABELS.instructors.alreadyPending
            : error.code === 'ALREADY_LINKED'
              ? GYM_LABELS.instructors.alreadyLinked
              : error.message
          : 'No se pudo enviar la solicitud';
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message,
        variant: 'error',
      });
      await loadRoster();
    } finally {
      setBusyId(null);
    }
  };

  const handleUnlink = async (instructorId: string) => {
    if (!window.confirm(GYM_LABELS.instructors.unlinkConfirm)) return;
    setBusyId(instructorId);
    try {
      await apiUnlinkInstructor(instructorId);
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: GYM_LABELS.instructors.removedFromStaff,
        variant: 'success',
      });
      await loadRoster();
    } catch (error) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: error instanceof ApiClientError ? error.message : 'No se pudo quitar al instructor',
        variant: 'error',
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    setBusyId(inviteId);
    try {
      await apiCancelInstructorInvite(inviteId);
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: GYM_LABELS.instructors.inviteCancelled,
        variant: 'success',
      });
      await loadRoster();
    } catch (error) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: error instanceof ApiClientError ? error.message : 'No se pudo cancelar la solicitud',
        variant: 'error',
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-8 pb-4">
      <GymStaffHero linked={linkedCount} pending={pendingCount} />

      {loading ? (
        <p className="text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
      ) : roster.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--fn-border)] px-6 py-16 text-center">
          <p className="text-[var(--fn-text-muted)]">{GYM_LABELS.instructors.noInstructors}</p>
        </div>
      ) : (
        <GymStaffGrid>
          {roster.map((item) => (
            <GymStaffCard
              key={item.id}
              item={item}
              busy={busyId === item.id || busyId === item.inviteId}
              onAdd={handleAdd}
              onUnlink={handleUnlink}
              onCancelInvite={handleCancelInvite}
            />
          ))}
        </GymStaffGrid>
      )}
    </div>
  );
}
