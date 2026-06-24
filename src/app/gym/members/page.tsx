'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  ClubAlertBanner,
  ClubEmptyState,
  ClubMemberRow,
  ClubMembersFilterBar,
  ClubMembersHero,
  ClubPagination,
} from '@/components/gym/club-members-ui';
import { DashboardPage } from '@/components/dashboard/dashboard-ui';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import {
  apiRemoveClubMember,
  apiGetClubMembersSummary,
  apiGetGymSubscription,
  apiListClubMembers,
  apiListClubMembershipPlans,
} from '@/services/api';
import { ApiClientError } from '@/services/api-client';
import { ALERT_LABELS, CLUB_LABELS, GENERAL_LABELS } from '@/constants/labels';
import type { ClubMember, ClubMemberFeeStatus, ClubMembershipPlan, GymSubscription, PaginationMeta } from '@/types/api';
import { MemberLimitAlert } from '@/components/gym/gym-saas-plan-cards';
import {
  clubPlanCadenceLabel,
  normalizeClubMembersSummary,
  normalizePlanList,
  parseFeeStatusFilter,
} from '@/utils/club-members';

type FeeFilter = ClubMemberFeeStatus | 'all';

const PAGE_SIZE = 20;

const DEFAULT_META: PaginationMeta = {
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 1,
};

function GymMembersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFilter = parseFeeStatusFilter(searchParams.get('feeStatus'));
  const initialPlanId = searchParams.get('planId') ?? 'all';
  const initialPage = Math.max(1, Number(searchParams.get('page')) || 1);
  const { showNotice } = useNoticeModal();

  const [members, setMembers] = useState<ClubMember[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_META);
  const [summary, setSummary] = useState({ total: 0, current: 0, pending: 0, overdue: 0 });
  const [subscription, setSubscription] = useState<GymSubscription | null>(null);
  const [plans, setPlans] = useState<ClubMembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feeFilter, setFeeFilter] = useState<FeeFilter>(initialFilter);
  const [planFilter, setPlanFilter] = useState(initialPlanId);
  const [page, setPage] = useState(initialPage);
  const [query, setQuery] = useState('');

  const syncUrl = useCallback(
    (next: { feeFilter: FeeFilter; planFilter: string; page: number }) => {
      const params = new URLSearchParams();
      if (next.feeFilter !== 'all') params.set('feeStatus', next.feeFilter);
      if (next.planFilter !== 'all') params.set('planId', next.planFilter);
      if (next.page > 1) params.set('page', String(next.page));
      const qs = params.toString();
      router.replace(qs ? `/gym/members?${qs}` : '/gym/members', { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    apiListClubMembershipPlans()
      .then((res) => setPlans(normalizePlanList(res)))
      .catch(() => setPlans([]));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const errors: string[] = [];

    const [listResult, summaryResult, subResult] = await Promise.allSettled([
      apiListClubMembers({
        feeStatus: feeFilter === 'all' ? undefined : feeFilter,
        planId: planFilter === 'all' ? undefined : planFilter,
        q: query || undefined,
        page,
        limit: PAGE_SIZE,
      }),
      apiGetClubMembersSummary(),
      apiGetGymSubscription(),
    ]);

    if (listResult.status === 'fulfilled') {
      setMembers(listResult.value.data);
      setMeta(listResult.value.meta ?? DEFAULT_META);
    } else {
      setMembers([]);
      setMeta(DEFAULT_META);
      const err = listResult.reason;
      errors.push(
        err instanceof ApiClientError ? err.message : CLUB_LABELS.members.loadError,
      );
    }

    if (summaryResult.status === 'fulfilled') {
      setSummary(normalizeClubMembersSummary(summaryResult.value));
    } else {
      setSummary({ total: 0, current: 0, pending: 0, overdue: 0 });
    }

    if (subResult.status === 'fulfilled') {
      setSubscription(subResult.value);
    } else {
      setSubscription(null);
    }

    setLoadError(errors[0] ?? null);
    setLoading(false);
  }, [feeFilter, planFilter, page, query]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    syncUrl({ feeFilter, planFilter, page });
  }, [feeFilter, planFilter, page, syncUrl]);

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

  const planOptions = useMemo(
    () => [
      { value: 'all', label: CLUB_LABELS.members.allPlans },
      ...plans.map((p) => ({
        value: p.id,
        label: `${p.name} (${clubPlanCadenceLabel(p.cadence)})`,
      })),
    ],
    [plans],
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
        subscription={subscription}
      />

      {subscription ? <MemberLimitAlert subscription={subscription} /> : null}

      <ClubMembersFilterBar
        feeFilters={filters}
        feeFilter={feeFilter}
        onFeeFilterChange={(id) => {
          setFeeFilter(id);
          setPage(1);
        }}
        searchLabel={GENERAL_LABELS.search}
        searchPlaceholder={CLUB_LABELS.members.searchPlaceholder}
        query={query}
        onQueryChange={setQuery}
        onSearch={() => {
          setPage(1);
          void load();
        }}
        planFilterLabel={CLUB_LABELS.members.filterPlan}
        planOptions={planOptions}
        planFilter={planFilter}
        onPlanFilterChange={(value) => {
          setPlanFilter(value);
          setPage(1);
        }}
        showPlanFilter={plans.length > 0}
      />

      {loadError ? <ClubAlertBanner>{loadError}</ClubAlertBanner> : null}

      {loading ? (
        <p className="text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
      ) : members.length === 0 ? (
        <ClubEmptyState title={CLUB_LABELS.members.empty} />
      ) : (
        <>
          <div className="relative z-0 overflow-hidden rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-sm">
            {members.map((m) => (
              <ClubMemberRow
                key={m.id}
                member={m}
                busy={busyId === m.id}
                onDeactivate={handleDeactivate}
              />
            ))}
          </div>
          <ClubPagination meta={meta} loading={loading} onPageChange={setPage} />
        </>
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
