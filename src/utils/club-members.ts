import type {
  ClubMember,
  ClubMemberFeeStatus,
  ClubMemberInvite,
  ClubMembershipPlan,
  ClubMembersSummary,
  ClubPlanCadence,
  AthleteClubMembership,
  Money,
} from '@/types/api';
import { CLUB_LABELS } from '@/constants/labels';
import { DEFAULT_CURRENCY } from '@/constants/fitnexia';
import { resolveMediaUrl } from '@/utils/media';

const EMPTY_SUMMARY: ClubMembersSummary = {
  total: 0,
  current: 0,
  pending: 0,
  overdue: 0,
};

const FEE_STATUSES: ClubMemberFeeStatus[] = ['current', 'pending', 'overdue'];

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (trimmed && trimmed !== 'undefined' && trimmed !== 'null') return trimmed;
  }
  return '';
}

function parseMoney(value: unknown): Money {
  const record = asRecord(value);
  if (record && typeof record.amount === 'number') {
    return {
      amount: record.amount,
      currency: String(record.currency ?? DEFAULT_CURRENCY),
    };
  }
  if (typeof value === 'number') {
    return { amount: value, currency: DEFAULT_CURRENCY };
  }
  return { amount: 0, currency: DEFAULT_CURRENCY };
}

function parseFeeStatus(value: unknown): ClubMemberFeeStatus {
  if (typeof value === 'string' && FEE_STATUSES.includes(value as ClubMemberFeeStatus)) {
    return value as ClubMemberFeeStatus;
  }
  return 'current';
}

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

function nestedProfile(record: Record<string, unknown>): Record<string, unknown> | null {
  const nestedSources = [
    record.profile,
    asRecord(record.user)?.profile,
    asRecord(record.athlete)?.profile,
    asRecord(record.athleteUser)?.profile,
    asRecord(record.memberUser)?.profile,
    asRecord(record.linkedUser)?.profile,
    record.athleteProfile,
  ];
  for (const source of nestedSources) {
    const profile = asRecord(source);
    if (profile) return profile;
  }
  return null;
}

function personRecord(record: Record<string, unknown>): Record<string, unknown> {
  const profile = nestedProfile(record);
  const nestedUser =
    asRecord(record.user) ??
    asRecord(record.athlete) ??
    asRecord(record.athleteUser) ??
    asRecord(record.memberUser) ??
    asRecord(record.linkedUser) ??
    asRecord(record.account);

  return {
    ...(nestedUser ?? {}),
    ...(profile ?? {}),
  };
}

function membershipRecord(record: Record<string, unknown>): Record<string, unknown> {
  return asRecord(record.membership) ?? asRecord(record.memberRecord) ?? record;
}

function pickPhotoValue(value: unknown): string {
  if (typeof value === 'string') return pickString(value);
  const record = asRecord(value);
  if (!record) return '';
  return pickString(record.publicUrl, record.url, record.href, record.src, record.path);
}

const PHOTO_FIELD_KEYS = [
  'photoUrl',
  'avatarUrl',
  'avatarUri',
  'avatar',
  'picture',
  'profilePicture',
  'profileImage',
  'imageUrl',
  'photo',
  'image',
] as const;

function extractPhotoFromRecord(record: Record<string, unknown> | null): string {
  if (!record) return '';
  for (const key of PHOTO_FIELD_KEYS) {
    const parsed = pickPhotoValue(record[key]);
    if (parsed) return parsed;
  }
  return '';
}

function collectPhotoSources(raw: Record<string, unknown>): Array<Record<string, unknown> | null> {
  const membership = asRecord(raw.membership) ?? asRecord(raw.memberRecord);
  const user = asRecord(raw.user);
  const athlete = asRecord(raw.athlete);
  const profile = nestedProfile(raw);

  return [
    raw,
    membership,
    profile,
    asRecord(raw.profile),
    asRecord(raw.athleteProfile),
    asRecord(raw.memberProfile),
    asRecord(raw.userProfile),
    asRecord(raw.profileSummary),
    user,
    athlete,
    asRecord(raw.athleteUser),
    asRecord(raw.memberUser),
    asRecord(raw.linkedUser),
    asRecord(raw.account),
    user ? nestedProfile(user) : null,
    athlete ? nestedProfile(athlete) : null,
    personRecord(raw),
    asRecord(raw.contact),
    membership ? asRecord(membership.contact) : null,
  ];
}

function pickPhotoUrl(...sources: Array<Record<string, unknown> | null>): string | undefined {
  for (const source of sources) {
    const url = extractPhotoFromRecord(source);
    if (url) return url;
  }
  return undefined;
}

function extractMemberItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];

  const record = payload as Record<string, unknown>;
  if (Array.isArray(record.data)) return record.data;
  if (Array.isArray(record.members)) return record.members;
  if (Array.isArray(record.items)) return record.items;

  const nestedData = asRecord(record.data);
  if (nestedData) {
    if (Array.isArray(nestedData.data)) return nestedData.data;
    if (Array.isArray(nestedData.members)) return nestedData.members;
    if (Array.isArray(nestedData.items)) return nestedData.items;
  }

  return [];
}

/** Map API member shapes (nested user/plan/membership) into ClubMember. */
export function normalizeClubMember(raw: unknown): ClubMember | null {
  const root = asRecord(raw);
  if (!root) return null;

  const container = asRecord(root.member) ?? asRecord(root.memberData) ?? root;
  const membership = membershipRecord(container);
  const person = personRecord(container);
  const contact = asRecord(container.contact) ?? asRecord(membership.contact);
  const plan =
    asRecord(container.plan) ??
    asRecord(container.membershipPlan) ??
    asRecord(membership.plan) ??
    asRecord(membership.membershipPlan);

  const id = pickString(container.id, container.memberId, root.id, root.memberId, membership.id, membership.memberId);
  if (!id) return null;

  const fullName = pickString(
    container.name,
    container.fullName,
    container.displayName,
    root.name,
    root.fullName,
    root.displayName,
    membership.fullName,
    membership.displayName,
    membership.name,
    person.fullName,
    person.displayName,
    person.name,
  );

  let firstName = pickString(
    container.firstName,
    root.firstName,
    membership.firstName,
    person.firstName,
  );
  let lastName = pickString(
    container.lastName,
    root.lastName,
    membership.lastName,
    person.lastName,
  );

  if (!firstName && !lastName && fullName) {
    const split = splitFullName(fullName);
    firstName = split.firstName;
    lastName = split.lastName;
  }

  const email = pickString(
    container.email,
    container.contactEmail,
    root.email,
    root.contactEmail,
    membership.email,
    membership.contactEmail,
    person.email,
    contact?.email,
  );

  const rawPhoto = pickPhotoUrl(...collectPhotoSources(container), ...collectPhotoSources(root));
  const photoUrl = resolveMediaUrl(rawPhoto) ?? rawPhoto;

  const planName = pickString(
    container.planName,
    root.planName,
    membership.planName,
    plan?.name,
    typeof container.plan === 'string' ? container.plan : undefined,
    typeof root.plan === 'string' ? root.plan : undefined,
  );

  const planId = pickString(container.planId, root.planId, membership.planId, plan?.id);

  return {
    id,
    institutionId: pickString(container.institutionId, root.institutionId, membership.institutionId),
    userId:
      pickString(
        container.userId,
        root.userId,
        membership.userId,
        person.id,
        asRecord(container.user)?.id,
        asRecord(root.user)?.id,
      ) || null,
    email,
    firstName,
    lastName,
    photoUrl: photoUrl || null,
    phone:
      pickString(container.phone, root.phone, membership.phone, person.phone, contact?.phone) ||
      null,
    planId,
    planName: planName || undefined,
    feeStatus: parseFeeStatus(
      container.feeStatus ??
        root.feeStatus ??
        membership.feeStatus ??
        container.paymentStatus ??
        root.paymentStatus ??
        membership.paymentStatus,
    ),
    nextDueAt:
      pickString(
        container.nextDueAt,
        container.dueAt,
        root.nextDueAt,
        root.dueAt,
        membership.nextDueAt,
        membership.dueAt,
      ) || null,
    subscriptionStatus: (container.subscriptionStatus ??
      root.subscriptionStatus ??
      membership.subscriptionStatus) as ClubMember['subscriptionStatus'],
    joinedAt:
      pickString(
        container.joinedAt,
        container.createdAt,
        root.joinedAt,
        root.createdAt,
        membership.joinedAt,
        membership.createdAt,
      ) || new Date().toISOString(),
    leftAt: pickString(container.leftAt, root.leftAt, membership.leftAt) || null,
  };
}

export function formatClubMemberName(
  member: Pick<ClubMember, 'firstName' | 'lastName' | 'email'>,
): string {
  const name = `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim();
  if (name && !name.includes('undefined')) return name;
  return member.email || 'Socio';
}

export function clubMemberInitials(member: Pick<ClubMember, 'firstName' | 'lastName' | 'email'>): string {
  const name = formatClubMemberName(member);
  if (name.includes('@')) return name.charAt(0).toUpperCase();
  return name
    .split(/\s+/)
    .map((p) => p.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/** Avatar URL for display — API photo when present, otherwise generated initials avatar. */
export function clubMemberAvatarSrc(
  member: Pick<ClubMember, 'firstName' | 'lastName' | 'email' | 'photoUrl'>,
  options?: { useGenerated?: boolean },
): string {
  if (member.photoUrl && !options?.useGenerated) return member.photoUrl;
  const name = encodeURIComponent(formatClubMemberName(member));
  return `https://ui-avatars.com/api/?name=${name}&background=6366f1&color=ffffff&size=128&bold=true&format=svg`;
}

export function formatClubPlanLabel(
  member: Pick<ClubMember, 'planName' | 'planId'>,
): string {
  if (member.planName?.trim()) return member.planName.trim();
  if (member.planId?.trim()) return member.planId;
  return '—';
}

function normalizePlan(raw: unknown): ClubMembershipPlan | null {
  const r = asRecord(raw);
  if (!r || !r.id) return null;
  return {
    id: String(r.id),
    institutionId: String(r.institutionId ?? ''),
    name: String(r.name ?? 'Plan'),
    cadence: (r.cadence ?? 'monthly') as ClubPlanCadence,
    price: parseMoney(r.price ?? r.priceCents),
    familySlots: typeof r.familySlots === 'number' ? r.familySlots : undefined,
    active: r.active !== false,
    memberCount: typeof r.memberCount === 'number' ? r.memberCount : undefined,
  };
}

export function parseFeeStatusFilter(value: string | null): ClubMemberFeeStatus | 'all' {
  if (value === 'current' || value === 'pending' || value === 'overdue') return value;
  return 'all';
}

export function normalizeClubMembersList(payload: unknown): ClubMember[] {
  return extractMemberItems(payload)
    .map(normalizeClubMember)
    .filter((m): m is ClubMember => m !== null);
}

export function normalizePlanList(payload: unknown): ClubMembershipPlan[] {
  if (!payload || typeof payload !== 'object') return [];
  const record = payload as Record<string, unknown>;
  if (!Array.isArray(record.data)) return [];
  return record.data.map(normalizePlan).filter((p): p is ClubMembershipPlan => p !== null);
}

export function normalizeInviteList(payload: unknown): ClubMemberInvite[] {
  if (!payload || typeof payload !== 'object') return [];
  const record = payload as Record<string, unknown>;
  if (!Array.isArray(record.data)) return [];
  return record.data as ClubMemberInvite[];
}

export function normalizeAthleteMembershipsList(payload: unknown): AthleteClubMembership[] {
  if (!payload || typeof payload !== 'object') return [];
  const record = payload as Record<string, unknown>;
  if (!Array.isArray(record.data)) return [];
  const items: AthleteClubMembership[] = [];
  for (const raw of record.data) {
    const r = asRecord(raw);
    if (!r) continue;
    const institution = asRecord(r.institution);
    const plan = asRecord(r.plan);
    const id = String(r.id ?? r.memberId ?? '');
    if (!id) continue;
    items.push({
      id,
      institutionId: String(r.institutionId ?? institution?.id ?? ''),
      institutionName: String(r.institutionName ?? institution?.name ?? 'Club'),
      planName: String(r.planName ?? plan?.name ?? ''),
      feeStatus: parseFeeStatus(r.feeStatus),
      nextDueAt: (r.nextDueAt ?? null) as string | null | undefined,
      subscriptionStatus: r.subscriptionStatus as AthleteClubMembership['subscriptionStatus'],
    });
  }
  return items;
}

export function normalizeClubMembersSummary(payload: unknown): ClubMembersSummary {
  if (!payload || typeof payload !== 'object') return { ...EMPTY_SUMMARY };
  const record = payload as Record<string, unknown>;
  const raw =
    record.data && typeof record.data === 'object'
      ? (record.data as Record<string, unknown>)
      : record;
  return {
    total: Number(raw.total) || 0,
    current: Number(raw.current) || 0,
    pending: Number(raw.pending) || 0,
    overdue: Number(raw.overdue) || 0,
    collectionRate:
      typeof raw.collectionRate === 'number' ? raw.collectionRate : undefined,
  };
}

export function clubFeeStatusLabel(status: ClubMemberFeeStatus): string {
  return CLUB_LABELS.feeStatus[status];
}

export function clubPlanCadenceLabel(cadence: ClubPlanCadence): string {
  return CLUB_LABELS.planCadence[cadence];
}

export function clubFeeStatusVariant(
  status: ClubMemberFeeStatus,
): 'success' | 'warning' | 'danger' | 'default' {
  if (status === 'current') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'overdue') return 'danger';
  return 'default';
}
