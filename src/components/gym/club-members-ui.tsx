'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  CalendarClock,
  CreditCard,
  Mail,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FilterChip } from '@/components/ui/filter-chip';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { CLUB_LABELS, GENERAL_LABELS } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';
import type {
  AthleteClubMembership,
  ClubMember,
  ClubMemberFeeStatus,
  ClubMemberInvite,
  ClubMembershipPlan,
  PaginationMeta,
} from '@/types/api';
import {
  clubFeeStatusLabel,
  clubFeeStatusVariant,
  clubPlanCadenceLabel,
  formatClubMemberName,
  formatClubPlanLabel,
  shouldShowMemberEmail,
} from '@/utils/club-members';
import { formatClassDate, formatMoneyFromCents } from '@/utils/format';

const HERO_GRADIENT =
  'relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-[#2563eb] to-slate-900 px-6 py-8 md:px-10 md:py-10';

function HeroBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
      <div className="absolute -right-12 -top-12 h-52 w-52 rounded-full bg-fuchsia-400/40 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-cyan-400/30 blur-2xl" />
    </div>
  );
}

export function ClubAlertBanner({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-3.5 text-sm text-amber-950 shadow-sm dark:border-amber-900/50 dark:from-amber-950/50 dark:to-orange-950/30 dark:text-amber-100">
      {children}
    </p>
  );
}

export function ClubEmptyState({
  title,
  description,
  icon: Icon = Users,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/30 px-8 py-16 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--fn-primary-muted)] to-violet-500/20 text-[var(--fn-primary)]">
        <Icon size={26} strokeWidth={2.25} />
      </span>
      <p className="text-lg font-bold text-[var(--fn-text)]">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--fn-text-muted)]">{description}</p>
      ) : null}
    </div>
  );
}

export function ClubSection({
  title,
  subtitle,
  icon: Icon,
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/40 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          {Icon ? (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]">
              <Icon size={18} strokeWidth={2.25} />
            </span>
          ) : null}
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-[var(--fn-text)]">{title}</h2>
            {subtitle ? (
              <p className="mt-0.5 text-sm text-[var(--fn-text-muted)]">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className="space-y-4 p-6">{children}</div>
    </section>
  );
}

export function ClubToolbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-20 overflow-visible rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4 shadow-sm">
      {children}
    </div>
  );
}

export function ClubSearchBar({
  label,
  placeholder,
  value,
  onChange,
  onSearch,
  searchLabel,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  searchLabel: string;
}) {
  return (
    <form
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
    >
      <div className="min-w-0 flex-1">
        <Input
          label={label}
          compact
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      <Button
        type="submit"
        title={searchLabel}
        size="sm"
        className="h-12 w-full shrink-0 px-6 sm:w-auto"
      />
    </form>
  );
}

export function ClubMembersFilterBar({
  feeFilters,
  feeFilter,
  onFeeFilterChange,
  searchLabel,
  searchPlaceholder,
  query,
  onQueryChange,
  onSearch,
  planFilterLabel,
  planOptions,
  planFilter,
  onPlanFilterChange,
  showPlanFilter,
}: {
  feeFilters: ReadonlyArray<{ id: ClubMemberFeeStatus | 'all'; label: string }>;
  feeFilter: ClubMemberFeeStatus | 'all';
  onFeeFilterChange: (id: ClubMemberFeeStatus | 'all') => void;
  searchLabel: string;
  searchPlaceholder: string;
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  planFilterLabel: string;
  planOptions: { value: string; label: string }[];
  planFilter: string;
  onPlanFilterChange: (value: string) => void;
  showPlanFilter: boolean;
}) {
  return (
    <ClubToolbar>
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--fn-text-secondary)]">
            {CLUB_LABELS.members.columns.status}
          </p>
          <div className="flex flex-wrap gap-2">
            {feeFilters.map((f) => (
              <FilterChip
                key={f.id}
                label={f.label}
                active={feeFilter === f.id}
                onPress={() => onFeeFilterChange(f.id)}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 border-t border-[var(--fn-border)] pt-4 lg:flex-row lg:items-end">
          <div className="min-w-0 flex-1">
            <ClubSearchBar
              label={searchLabel}
              placeholder={searchPlaceholder}
              value={query}
              onChange={onQueryChange}
              onSearch={onSearch}
              searchLabel={searchLabel}
            />
          </div>
          {showPlanFilter ? (
            <div className="w-full shrink-0 lg:w-72">
              <Select
                compact
                label={planFilterLabel}
                value={planFilter}
                onChange={onPlanFilterChange}
                options={planOptions}
              />
            </div>
          ) : null}
        </div>
      </div>
    </ClubToolbar>
  );
}

export function ClubCardGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 lg:grid-cols-2">{children}</div>;
}

export function ClubFeeStatusBadge({ status }: { status: ClubMemberFeeStatus }) {
  return <Badge label={clubFeeStatusLabel(status)} variant={clubFeeStatusVariant(status)} size="sm" />;
}

export function ClubMembersHero({
  total,
  overdue,
  current,
}: {
  total: number;
  overdue: number;
  current: number;
}) {
  const showInvites = useFeature('clubMemberInvites');
  const showPlans = useFeature('clubMembershipPlans');
  return (
    <section className={HERO_GRADIENT}>
      <HeroBlobs />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Socios · Fitnexia</p>
          <h1 className="max-w-2xl text-3xl font-black leading-tight text-white md:text-4xl">
            {CLUB_LABELS.members.title}
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-white/80 md:text-base">
            {CLUB_LABELS.members.subtitle}
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <span className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
              {total} socios
            </span>
            <span className="rounded-full border border-emerald-300/40 bg-emerald-400/20 px-4 py-1.5 text-sm font-semibold text-emerald-100">
              {current} {CLUB_LABELS.feeStatus.current.toLowerCase()}
            </span>
            {overdue > 0 ? (
              <span className="rounded-full border border-red-300/40 bg-red-400/20 px-4 py-1.5 text-sm font-semibold text-red-100">
                {overdue} {CLUB_LABELS.feeStatus.overdue.toLowerCase()}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {showInvites ? (
            <Link href="/gym/members/invites">
              <Button
                title={CLUB_LABELS.members.invite}
                variant="secondary"
                className="!bg-white/15 !text-white hover:!bg-white/25"
              />
            </Link>
          ) : null}
          {showPlans ? (
            <Link href="/gym/membership-plans">
              <Button
                title={CLUB_LABELS.plans.create}
                variant="secondary"
                className="!bg-white/15 !text-white hover:!bg-white/25"
              />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function ClubPlansHero() {
  return (
    <section className={HERO_GRADIENT}>
      <HeroBlobs />
      <div className="relative space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Membresía · Fitnexia</p>
        <h1 className="max-w-2xl text-3xl font-black leading-tight text-white md:text-4xl">
          {CLUB_LABELS.plans.title}
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-white/80 md:text-base">
          {CLUB_LABELS.plans.subtitle}
        </p>
      </div>
    </section>
  );
}

export function ClubInvitesHero() {
  return (
    <section className={HERO_GRADIENT}>
      <HeroBlobs />
      <div className="relative space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Altas · Fitnexia</p>
        <h1 className="max-w-2xl text-3xl font-black leading-tight text-white md:text-4xl">
          {CLUB_LABELS.invites.title}
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-white/80 md:text-base">
          {CLUB_LABELS.invites.subtitle}
        </p>
      </div>
    </section>
  );
}

export function ClubAthleteHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-slate-900 px-6 py-8 md:px-10">
      <HeroBlobs />
      <div className="relative space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Tu cuenta</p>
        <h1 className="text-2xl font-black text-white md:text-3xl">{CLUB_LABELS.athlete.title}</h1>
        <p className="max-w-lg text-sm text-white/80">{CLUB_LABELS.athlete.subtitle}</p>
      </div>
    </section>
  );
}

function feeAccent(status: ClubMemberFeeStatus) {
  if (status === 'current') return 'from-emerald-500/20 via-transparent to-transparent';
  if (status === 'pending') return 'from-amber-500/25 via-transparent to-transparent';
  if (status === 'overdue') return 'from-red-500/25 via-transparent to-transparent';
  return 'from-[var(--fn-primary)]/15 via-transparent to-transparent';
}

export function ClubMemberRow({
  member,
  onDeactivate,
  busy,
}: {
  member: ClubMember;
  onDeactivate?: (id: string) => void;
  busy?: boolean;
}) {
  const name = formatClubMemberName(member);
  const planLabel = formatClubPlanLabel(member);
  const showEmail = shouldShowMemberEmail(member);

  return (
    <article className="group relative overflow-hidden border-b border-[var(--fn-border)] last:border-b-0 transition hover:bg-[var(--fn-surface-muted)]/50">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${feeAccent(member.feeStatus)} opacity-100`}
        aria-hidden="true"
      />
      <div className="relative flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div className="min-w-0">
          <Link
            href={`/gym/members/${member.id}`}
            className="truncate text-lg font-extrabold text-[var(--fn-text)] transition hover:text-[var(--fn-primary)]"
          >
            {name}
          </Link>
          {showEmail ? (
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-[var(--fn-text-muted)]">
              <Mail size={13} className="shrink-0 opacity-70" />
              {member.email}
            </p>
          ) : null}
          <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--fn-text-secondary)]">
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--fn-surface-muted)] px-2.5 py-1 font-semibold">
              <CreditCard size={12} />
              {planLabel}
            </span>
            {member.nextDueAt ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--fn-surface-muted)] px-2.5 py-1 font-semibold">
                <CalendarClock size={12} />
                {formatClassDate(member.nextDueAt)}
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">
          <ClubFeeStatusBadge status={member.feeStatus} />
          <Link href={`/gym/members/${member.id}`}>
            <Button title="Ver" variant="outline" size="sm" />
          </Link>
          {onDeactivate ? (
            <Button
              title="Baja"
              variant="ghost"
              size="sm"
              loading={busy}
              className="text-[var(--fn-error)] hover:bg-red-500/10"
              onClick={() => onDeactivate(member.id)}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function ClubMemberDetailCard({ member }: { member: ClubMember }) {
  const name = formatClubMemberName(member);
  const showEmail = shouldShowMemberEmail(member);
  return (
    <article className="relative overflow-hidden rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-sm">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${feeAccent(member.feeStatus)}`}
        aria-hidden="true"
      />
      <div className="relative space-y-5 p-6 md:p-8">
        <div className="flex flex-wrap items-start gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-black text-[var(--fn-text)]">{name}</h2>
            {showEmail ? (
              <p className="mt-1 text-sm text-[var(--fn-text-muted)]">{member.email}</p>
            ) : null}
            {member.phone ? <p className="text-sm text-[var(--fn-text-secondary)]">{member.phone}</p> : null}
          </div>
          <ClubFeeStatusBadge status={member.feeStatus} />
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/50 px-4 py-3">
            <dt className="text-xs font-bold uppercase tracking-wide text-[var(--fn-text-muted)]">
              {CLUB_LABELS.members.columns.plan}
            </dt>
            <dd className="mt-1 font-semibold text-[var(--fn-text)]">{formatClubPlanLabel(member)}</dd>
          </div>
          {member.nextDueAt ? (
            <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/50 px-4 py-3">
              <dt className="text-xs font-bold uppercase tracking-wide text-[var(--fn-text-muted)]">
                {CLUB_LABELS.members.columns.nextDue}
              </dt>
              <dd className="mt-1 font-semibold text-[var(--fn-text)]">
                {formatClassDate(member.nextDueAt)}
              </dd>
            </div>
          ) : null}
          {member.subscriptionStatus ? (
            <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/50 px-4 py-3">
              <dt className="text-xs font-bold uppercase tracking-wide text-[var(--fn-text-muted)]">
                Suscripción
              </dt>
              <dd className="mt-1 font-semibold capitalize text-[var(--fn-text)]">
                {member.subscriptionStatus}
              </dd>
            </div>
          ) : null}
          {member.joinedAt ? (
            <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/50 px-4 py-3">
              <dt className="text-xs font-bold uppercase tracking-wide text-[var(--fn-text-muted)]">
                Alta
              </dt>
              <dd className="mt-1 font-semibold text-[var(--fn-text)]">
                {formatClassDate(member.joinedAt)}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
    </article>
  );
}

export function ClubPlanCard({
  plan,
  onEdit,
  onDeactivate,
}: {
  plan: ClubMembershipPlan;
  onEdit: (plan: ClubMembershipPlan) => void;
  onDeactivate?: (id: string) => void;
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] transition hover:-translate-y-0.5 hover:border-[var(--fn-primary)]/40 hover:shadow-lg">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${
          plan.active
            ? 'from-[var(--fn-primary)]/10 via-transparent to-transparent'
            : 'from-slate-500/10 via-transparent to-transparent'
        }`}
        aria-hidden="true"
      />
      <div className="relative flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]">
            <Sparkles size={20} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-extrabold text-[var(--fn-text)]">{plan.name}</h3>
              <Badge
                label={plan.active ? 'Activo' : 'Inactivo'}
                variant={plan.active ? 'success' : 'default'}
                size="sm"
              />
            </div>
            <p className="mt-1 text-sm text-[var(--fn-text-muted)]">
              {clubPlanCadenceLabel(plan.cadence)} ·{' '}
              {formatMoneyFromCents(plan.price.amount, plan.price.currency)}
              {plan.memberCount != null ? ` · ${plan.memberCount} socios` : ''}
            </p>
            {plan.familySlots ? (
              <p className="mt-1 text-xs text-[var(--fn-text-muted)]">
                Hasta {plan.familySlots} cupos familiares
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button title={CLUB_LABELS.plans.edit} variant="outline" size="sm" onClick={() => onEdit(plan)} />
          {plan.active && onDeactivate ? (
            <Button
              title={CLUB_LABELS.plans.deactivated.replace('.', '')}
              variant="ghost"
              size="sm"
              className="text-[var(--fn-error)]"
              onClick={() => onDeactivate(plan.id)}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function ClubInviteRow({
  invite,
  onCopy,
  onCancel,
  busy,
}: {
  invite: ClubMemberInvite;
  onCopy: (invite: ClubMemberInvite) => void;
  onCancel?: (id: string) => void;
  busy?: boolean;
}) {
  const isPending = invite.status === 'pending';
  return (
    <article className="flex flex-col gap-3 border-b border-[var(--fn-border)] p-5 last:border-b-0 transition hover:bg-[var(--fn-surface-muted)]/40 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]">
          <UserPlus size={18} />
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-[var(--fn-text)]">{invite.email ?? invite.code}</p>
          <p className="text-sm text-[var(--fn-text-muted)]">
            {invite.planName ?? invite.planId} ·{' '}
            <span className="capitalize">{invite.status}</span>
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          title={CLUB_LABELS.invites.copyLink}
          variant="outline"
          size="sm"
          onClick={() => onCopy(invite)}
        />
        {isPending && onCancel ? (
          <Button
            title={CLUB_LABELS.invites.cancel}
            variant="ghost"
            size="sm"
            loading={busy}
            className="text-[var(--fn-error)]"
            onClick={() => onCancel(invite.id)}
          />
        ) : null}
      </div>
    </article>
  );
}

export function ClubAthleteMembershipCard({ membership }: { membership: AthleteClubMembership }) {
  return (
    <Link
      href={`/athlete/club-membership/${membership.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] transition hover:-translate-y-0.5 hover:border-[var(--fn-primary)]/40 hover:shadow-lg"
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${feeAccent(membership.feeStatus)}`}
        aria-hidden="true"
      />
      <div className="relative flex items-start gap-4 p-5 md:p-6">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--fn-primary-muted)] text-[var(--fn-primary)] transition group-hover:scale-105">
          <Building2 size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-extrabold text-[var(--fn-text)]">{membership.institutionName}</p>
          <p className="text-sm text-[var(--fn-text-muted)]">{membership.planName || '—'}</p>
          {membership.nextDueAt ? (
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--fn-text-secondary)]">
              <CalendarClock size={12} />
              {CLUB_LABELS.athlete.nextDue}: {formatClassDate(membership.nextDueAt)}
            </p>
          ) : null}
        </div>
        <ClubFeeStatusBadge status={membership.feeStatus} />
      </div>
    </Link>
  );
}

export function ClubInfoNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/60 px-5 py-4 text-sm leading-relaxed text-[var(--fn-text-muted)]">
      {children}
    </p>
  );
}

export function ClubPagination({
  meta,
  onPageChange,
  loading,
}: {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  loading?: boolean;
}) {
  if (meta.totalPages <= 1 && meta.total <= meta.limit) return null;

  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] px-4 py-3 sm:flex-row">
      <p className="text-sm text-[var(--fn-text-muted)]">
        {CLUB_LABELS.members.pageOf(meta.page, meta.totalPages)}
        {meta.total > 0 ? ` · ${meta.total} socios` : ''}
      </p>
      <div className="flex gap-2">
        <Button
          title={CLUB_LABELS.members.previousPage}
          variant="outline"
          size="sm"
          disabled={loading || meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        />
        <Button
          title={CLUB_LABELS.members.nextPage}
          variant="outline"
          size="sm"
          disabled={loading || meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        />
      </div>
    </div>
  );
}

export function ClubMemberEditForm({
  plans,
  planId,
  onPlanChange,
  email,
  onEmailChange,
  firstName,
  onFirstNameChange,
  lastName,
  onLastNameChange,
  phone,
  onPhoneChange,
  onSubmit,
  onCancel,
  loading,
}: {
  plans: ClubMembershipPlan[];
  planId: string;
  onPlanChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  firstName: string;
  onFirstNameChange: (value: string) => void;
  lastName: string;
  onLastNameChange: (value: string) => void;
  phone: string;
  onPhoneChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const planOptions = plans.map((p) => ({
    value: p.id,
    label: `${p.name} (${clubPlanCadenceLabel(p.cadence)})`,
  }));

  return (
    <ClubSection title={CLUB_LABELS.members.edit} icon={UserPlus}>
      <Select
        label={CLUB_LABELS.invites.plan}
        value={planId}
        onChange={onPlanChange}
        options={planOptions}
      />
      <Input
        label={CLUB_LABELS.members.columns.email}
        type="email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={CLUB_LABELS.members.columns.name}
          value={firstName}
          onChange={(e) => onFirstNameChange(e.target.value)}
        />
        <Input
          label={GENERAL_LABELS.lastName}
          value={lastName}
          onChange={(e) => onLastNameChange(e.target.value)}
        />
      </div>
      <Input
        label={CLUB_LABELS.members.phone}
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value)}
      />
      <div className="flex flex-wrap gap-2 pt-1">
        <Button title={GENERAL_LABELS.saveChange} onClick={onSubmit} loading={loading} />
        <Button title={GENERAL_LABELS.cancel} variant="outline" onClick={onCancel} />
      </div>
    </ClubSection>
  );
}
