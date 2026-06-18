'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import {
  ClubAlertBanner,
  ClubEmptyState,
  ClubMemberRow,
  ClubMembersHero,
  ClubSearchBar,
  ClubToolbar,
} from '@/components/gym/club-members-ui';
import { DashboardPage } from '@/components/dashboard/dashboard-ui';
import { FilterChip } from '@/components/ui/filter-chip';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import {
  apiRemoveClubMember,
  apiGetClubMembersSummary,
  apiListClubMembers,
} from '@/services/api';
import { ApiClientError } from '@/services/api-client';
import { ALERT_LABELS, CLUB_LABELS, GENERAL_LABELS } from '@/constants/labels';
import type { ClubMember, ClubMemberFeeStatus } from '@/types/api';
import {
  normalizeClubMembersList,
  normalizeClubMembersSummary,
  parseFeeStatusFilter,
} from '@/utils/club-members';

type FeeFilter = ClubMemberFeeStatus | 'all';

function GymMembersPageContent() {
  const searchParams = useSearchParams();
  const initialFilter = parseFeeStatusFilter(searchParams.get('feeStatus'));
  const { showNotice } = useNoticeModal();
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [summary, setSummary] = useState({ total: 0, current: 0, pending: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feeFilter, setFeeFilter] = useState<FeeFilter>(initialFilter);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const errors: string[] = [];

    const [listResult, summaryResult] = await Promise.allSettled([
      apiListClubMembers({
        feeStatus: feeFilter === 'all' ? undefined : feeFilter,
        q: query || undefined,
        limit: 50,
      }),
      apiGetClubMembersSummary(),
    ]);

    if (listResult.status === 'fulfilled') {
      setMembers(normalizeClubMembersList(listResult.value));
    } else {
      setMembers([]);
      const err = listResult.reason;
      errors.push(
        err instanceof ApiClientError ? err.message : CLUB_LABELS.members.loadError,
      );
    }

    if (summaryResult.status === 'fulfilled') {
      setSummary(normalizeClubMembersSummary(summaryResult.value));
    } else {
      setSummary({ total: 0, current: 0, pending: 0, overdue: 0 });
      const err = summaryResult.reason;
      if (listResult.status !== 'fulfilled') {
        errors.push(
          err instanceof ApiClientError ? err.message : CLUB_LABELS.members.loadError,
        );
      }
    }

    setLoadError(errors[0] ?? null);
    setLoading(false);
  }, [feeFilter, query]);

  useEffect(() => {
    load();
  }, [load]);

  const filters = useMemo(
    () =>
      [
        { id: 'all' as const, label: CLUB_LABELS.members.filterAll },
        { id: 'current' as const, label: CLUB_LABELS.feeStatus.current },
        { id: 'pending' as const, label: CLUB_LABELS.feeStatus.pending },
        { id: 'overdue' as const, label: CLUB_LABELS.feeStatus.overdue },
      ] as const,
    [],
  );

  const handleDeactivate = async (id: string) => {
    if (!window.confirm(CLUB_LABELS.members.deactivateConfirm)) return;
    setBusyId(id);
    try {
      await apiRemoveClubMember(id);
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: CLUB_LABELS.members.deactivated,
        variant: 'success',
      });
      await load();
    } catch (error) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: error instanceof ApiClientError ? error.message : 'No se pudo dar de baja',
        variant: 'error',
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardPage>
      <ClubMembersHero
        total={summary.total}
        overdue={summary.overdue}
        current={summary.current}
      />

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <FilterChip
            key={f.id}
            label={f.label}
            active={feeFilter === f.id}
            onPress={() => setFeeFilter(f.id)}
          />
        ))}
      </div>

      <ClubToolbar>
        <ClubSearchBar
          label={GENERAL_LABELS.search}
          placeholder={CLUB_LABELS.members.searchPlaceholder}
          value={query}
          onChange={setQuery}
          onSearch={load}
          searchLabel={GENERAL_LABELS.search}
        />
      </ClubToolbar>

      {loadError ? <ClubAlertBanner>{loadError}</ClubAlertBanner> : null}

      {loading ? (
        <p className="text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
      ) : members.length === 0 ? (
        <ClubEmptyState title={CLUB_LABELS.members.empty} />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-sm">
          {members.map((m) => (
            <ClubMemberRow
              key={m.id}
              member={m}
              busy={busyId === m.id}
              onDeactivate={handleDeactivate}
            />
          ))}
        </div>
      )}
    </DashboardPage>
  );
}

export default function GymMembersPage() {
  return (
    <Suspense fallback={<p className="p-6 text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>}>
      <GymMembersPageContent />
    </Suspense>
  );
}
