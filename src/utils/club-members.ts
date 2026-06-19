import type {
  ClubMember,
  ClubMemberFeeStatus,
  ClubMemberInvite,
  ClubMembershipCharge,
  ClubMembershipPlan,
  ClubMembershipStatement,
  ClubMembersSummary,
  ClubPlanCadence,
  AthleteClubMembership,
  MembershipBillingSettings,
  Money,
  PaginationMeta,
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
  if (value === 'up_to_date') return 'current';
  if (typeof value === 'string' && FEE_STATUSES.includes(value as ClubMemberFeeStatus)) {
    return value as ClubMemberFeeStatus;
  }
  return 'current';
}

function mapSubscriptionStatus(
  value: unknown,
): ClubMembershipStatement['subscriptionStatus'] {
  if (value === 'pending_authorization' || value === 'none' || value == null) return 'none';
  if (value === 'active' || value === 'past_due' || value === 'cancelled') return value;
  return 'none';
}

function mapChargeStatus(value: unknown): ClubMembershipCharge['status'] {
  if (value === 'approved') return 'paid';
  if (value === 'paid' || value === 'pending' || value === 'failed' || value === 'refunded') {
    return value;
  }
  return 'pending';
}

export function feeStatusToBackendQuery(
  feeStatus?: ClubMemberFeeStatus,
): string | undefined {
  if (!feeStatus) return undefined;
  if (feeStatus === 'current') return 'up_to_date';
  return feeStatus;
}

export function toBackendPlanBody(body: {
  name: string;
  cadence: ClubPlanCadence;
  price: Money;
  familySlots?: number;
  active?: boolean;
}): Record<string, unknown> {
  return {
    name: body.name,
    billingFrequency: body.cadence,
    priceCents: body.price.amount,
    priceCurrency: body.price.currency,
    planType: body.familySlots && body.familySlots > 1 ? 'family' : 'individual',
    maxMembers: body.familySlots,
    active: body.active,
  };
}

export function toBackendPlanPatch(body: Partial<{
  name: string;
  cadence: ClubPlanCadence;
  price: Money;
  familySlots: number;
  active: boolean;
}>): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) patch.name = body.name;
  if (body.cadence !== undefined) patch.billingFrequency = body.cadence;
  if (body.price !== undefined) {
    patch.priceCents = body.price.amount;
    patch.priceCurrency = body.price.currency;
  }
  if (body.familySlots !== undefined) {
    patch.maxMembers = body.familySlots;
    patch.planType = body.familySlots > 1 ? 'family' : 'individual';
  }
  if (body.active !== undefined) patch.active = body.active;
  return patch;
}

export function toBackendMemberBody(body: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  planId?: string;
}): Record<string, unknown> {
  const contactName = `${body.firstName ?? ''} ${body.lastName ?? ''}`.trim();
  const out: Record<string, unknown> = {};
  if (body.planId !== undefined) out.planId = body.planId;
  if (contactName) out.contactName = contactName;
  if (body.email !== undefined) out.contactEmail = body.email.trim().toLowerCase();
  if (body.phone !== undefined) out.contactPhone = body.phone.trim() || null;
  return out;
}

export function normalizeBillingSettings(payload: unknown): MembershipBillingSettings {
  const r = asRecord(payload);
  if (!r) return {};
  return {
    reminderDaysBeforeDue:
      typeof r.dueReminderDays === 'number'
        ? r.dueReminderDays
        : typeof r.reminderDaysBeforeDue === 'number'
          ? r.reminderDaysBeforeDue
          : undefined,
    graceDays: typeof r.graceDays === 'number' ? r.graceDays : undefined,
  };
}

export function toBackendBillingSettingsPatch(
  body: Partial<MembershipBillingSettings & { graceDays?: number }>,
): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  if (body.reminderDaysBeforeDue !== undefined) {
    patch.dueReminderDays = body.reminderDaysBeforeDue;
  }
  if (body.graceDays !== undefined) patch.graceDays = body.graceDays;
  return patch;
}

export function normalizeMembershipStatement(payload: unknown): ClubMembershipStatement | null {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;

  const memberRaw = record.member ?? record;
  const member = normalizeClubMember(memberRaw);
  if (!member) return null;

  const planRaw = asRecord(record.plan) ?? {};
  const cadence = (planRaw.billingFrequency ?? planRaw.cadence ?? 'monthly') as ClubPlanCadence;
  const planId = String(planRaw.id ?? member.planId ?? '');
  const planName = String(planRaw.name ?? member.planName ?? 'Plan');

  const amountDueRaw = record.amountDue ?? record.balanceDue;
  const balanceDue = amountDueRaw ? parseMoney(amountDueRaw) : { amount: 0, currency: 'UYU' };

  const payments = Array.isArray(record.payments)
    ? record.payments
    : Array.isArray(record.charges)
      ? record.charges
      : [];

  const charges: ClubMembershipCharge[] = [];
  for (const raw of payments) {
    const p = asRecord(raw);
    if (!p || !p.id) continue;
    charges.push({
      id: String(p.id),
      memberId: member.id,
      amount: parseMoney(p.amount ?? p.amountCents),
      status: mapChargeStatus(p.status),
      periodStart: String(p.periodStart ?? p.createdAt ?? ''),
      periodEnd: String(p.periodEnd ?? p.createdAt ?? ''),
      mpPaymentId: (p.providerPaymentId ?? p.mpPaymentId ?? null) as string | null,
      createdAt: String(p.createdAt ?? ''),
    });
  }

  const nextDueAt = (record.nextDueDate ?? record.nextDueAt ?? member.nextDueAt ?? null) as
    | string
    | null;

  return {
    institutionId: member.institutionId,
    institutionName: String(record.institutionName ?? 'Club'),
    membershipId: member.id,
    plan: {
      id: planId,
      name: planName,
      cadence,
      price: parseMoney(planRaw.price ?? planRaw.priceCents),
    },
    feeStatus: member.feeStatus,
    balanceDue,
    nextDueAt,
    subscriptionStatus: mapSubscriptionStatus(
      member.subscriptionStatus ?? record.subscriptionStatus,
    ),
    charges,
  };
}

export function normalizeInvitePreview(payload: unknown): import('@/types/api').ClubInvitePreview | null {
  const r = asRecord(payload);
  if (!r) return null;
  const planRaw = asRecord(r.plan) ?? {};
  const cadence = (planRaw.billingFrequency ?? planRaw.cadence ?? 'monthly') as ClubPlanCadence;
  return {
    code: String(r.code ?? ''),
    institutionId: String(r.institutionId ?? ''),
    institutionName: String(r.institutionName ?? ''),
    plan: {
      id: String(planRaw.id ?? ''),
      name: String(planRaw.name ?? ''),
      cadence,
      price: parseMoney(planRaw.price ?? planRaw.priceCents),
    },
    expiresAt: (r.expiresAt as string | null | undefined) ?? null,
    valid: r.valid !== false,
  };
}

/** Client-side filter when backend list endpoint lacks search/plan filters. */
export function filterClubMembersLocally(
  members: ClubMember[],
  params: { feeStatus?: ClubMemberFeeStatus; planId?: string; q?: string },
): ClubMember[] {
  let list = members;
  if (params.feeStatus) {
    list = list.filter((m) => m.feeStatus === params.feeStatus);
  }
  if (params.planId) {
    list = list.filter((m) => m.planId === params.planId);
  }
  if (params.q?.trim()) {
    const q = params.q.trim().toLowerCase();
    list = list.filter((m) => {
      const name = formatClubMemberName(m).toLowerCase();
      return name.includes(q) || m.email.toLowerCase().includes(q);
    });
  }
  return list;
}

export function paginateLocally<T>(
  items: T[],
  page: number,
  limit: number,
): { items: T[]; meta: PaginationMeta } {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    meta: { page: safePage, limit, total, totalPages },
  };
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
    asRecord(record.linkedAthlete)?.profile,
    record.athleteProfile,
    record.userProfile,
    record.memberProfile,
    record.profileSummary,
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
    asRecord(record.linkedAthlete) ??
    asRecord(record.athleteUser) ??
    asRecord(record.memberUser) ??
    asRecord(record.linkedUser) ??
    asRecord(record.account);

  return {
    ...(nestedUser ?? {}),
    ...(profile ?? {}),
    ...(asRecord(record.userProfile) ?? {}),
    ...(asRecord(record.memberProfile) ?? {}),
    ...(asRecord(record.athleteProfile) ?? {}),
  };
}

/** When API wraps membership in `member`, keep sibling user/profile/plan from the root. */
function flattenMemberRaw(raw: Record<string, unknown>): Record<string, unknown> {
  const inner = asRecord(raw.member) ?? asRecord(raw.memberData);
  if (!inner) return raw;

  const siblingKeys = [
    'user',
    'profile',
    'athlete',
    'athleteProfile',
    'userProfile',
    'memberProfile',
    'profileSummary',
    'plan',
    'membershipPlan',
    'athleteUser',
    'memberUser',
    'linkedUser',
    'linkedAthlete',
    'contact',
  ] as const;

  const flat: Record<string, unknown> = { ...inner };
  for (const key of siblingKeys) {
    if (raw[key] !== undefined && flat[key] === undefined) {
      flat[key] = raw[key];
    }
  }
  if (!flat.id && raw.id) flat.id = raw.id;
  if (!flat.memberId && raw.memberId) flat.memberId = raw.memberId;
  return flat;
}

function pickNameField(record: Record<string, unknown>, camel: 'firstName' | 'lastName'): string {
  const snake = camel === 'firstName' ? 'first_name' : 'last_name';
  return pickString(record[camel], record[snake]);
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
  'photo_url',
  'avatarUrl',
  'avatar_url',
  'avatarUri',
  'avatar_uri',
  'avatar',
  'picture',
  'profilePicture',
  'profile_picture',
  'profileImage',
  'profile_image',
  'imageUrl',
  'image_url',
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
  const athlete = asRecord(raw.athlete) ?? asRecord(raw.linkedAthlete);
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

function deepExtractPhoto(value: unknown, depth = 0): string {
  if (depth > 8) return '';
  const record = asRecord(value);
  if (!record) return '';
  const direct = extractPhotoFromRecord(record);
  if (direct) return direct;
  for (const nested of Object.values(record)) {
    if (!nested || typeof nested !== 'object') continue;
    const found = deepExtractPhoto(nested, depth + 1);
    if (found) return found;
  }
  return '';
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

  const container = flattenMemberRaw(root);
  const membership = membershipRecord(container);
  const person = personRecord(container);
  const rootPerson = container === root ? person : personRecord(root);
  const contact = asRecord(container.contact) ?? asRecord(membership.contact);
  const plan =
    asRecord(container.plan) ??
    asRecord(container.membershipPlan) ??
    asRecord(membership.plan) ??
    asRecord(membership.membershipPlan);

  const id = pickString(
    container.id,
    container.memberId,
    root.id,
    root.memberId,
    membership.id,
    membership.memberId,
  );
  if (!id) return null;

  const contactName = pickString(
    container.contactName,
    root.contactName,
    membership.contactName,
    container.invitedName,
    root.invitedName,
  );

  const fullName = pickString(
    contactName,
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
    rootPerson.fullName,
    rootPerson.displayName,
    rootPerson.name,
    container.memberName,
    root.memberName,
  );

  let firstName = pickString(
    container.firstName,
    root.firstName,
    membership.firstName,
    person.firstName,
    rootPerson.firstName,
    pickNameField(container, 'firstName'),
    pickNameField(person, 'firstName'),
    pickNameField(rootPerson, 'firstName'),
  );
  let lastName = pickString(
    container.lastName,
    root.lastName,
    membership.lastName,
    person.lastName,
    rootPerson.lastName,
    pickNameField(container, 'lastName'),
    pickNameField(person, 'lastName'),
    pickNameField(rootPerson, 'lastName'),
  );

  if (!firstName && !lastName && contactName) {
    const split = splitFullName(contactName);
    firstName = split.firstName;
    lastName = split.lastName;
  }

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

  const rawPhoto =
    pickPhotoUrl(...collectPhotoSources(container), ...(container === root ? [] : collectPhotoSources(root))) ||
    deepExtractPhoto(root) ||
    undefined;
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
  if (name && !name.includes('undefined') && !looksLikeEmail(name)) return name;
  if (member.email) {
    const fromEmail = humanizeEmailLocalPart(member.email);
    if (fromEmail) return fromEmail;
  }
  return 'Socio';
}

function looksLikeEmail(value: string): boolean {
  return value.includes('@');
}

function humanizeEmailLocalPart(email: string): string {
  const local = email.split('@')[0] ?? '';
  const cleaned = local.replace(/\d+/g, ' ').replace(/[._-]+/g, ' ').trim();
  if (!cleaned) return '';
  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function shouldShowMemberEmail(
  member: Pick<ClubMember, 'firstName' | 'lastName' | 'email'>,
): boolean {
  if (!member.email?.trim()) return false;
  const displayName = formatClubMemberName(member);
  return displayName.toLowerCase() !== member.email.trim().toLowerCase();
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
  return `https://ui-avatars.com/api/?name=${name}&background=6366f1&color=ffffff&size=128&bold=true&format=png`;
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
    cadence: (r.billingFrequency ?? r.cadence ?? 'monthly') as ClubPlanCadence,
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

const EMPTY_PAGINATION: PaginationMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
};

export function parseClubMembersPage(payload: unknown): {
  members: ClubMember[];
  meta: PaginationMeta;
} {
  const members = normalizeClubMembersList(payload);
  if (!payload || typeof payload !== 'object') {
    return { members, meta: { ...EMPTY_PAGINATION, total: members.length } };
  }

  const record = payload as Record<string, unknown>;
  const metaRaw = asRecord(record.meta) ?? asRecord(asRecord(record.data)?.meta);
  if (!metaRaw) {
    return {
      members,
      meta: {
        page: 1,
        limit: members.length || EMPTY_PAGINATION.limit,
        total: members.length,
        totalPages: 1,
      },
    };
  }

  const total = Number(metaRaw.total) || members.length;
  const limit = Number(metaRaw.limit) || EMPTY_PAGINATION.limit;
  const page = Number(metaRaw.page) || 1;
  const totalPages = Number(metaRaw.totalPages) || Math.max(1, Math.ceil(total / limit));

  return {
    members,
    meta: { page, limit, total, totalPages },
  };
}

export function normalizeUpdatedClubMember(payload: unknown): ClubMember | null {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;
  const nested = asRecord(record.data) ?? asRecord(record.member);
  return normalizeClubMember(nested ?? payload);
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
    current: Number(raw.current ?? raw.upToDate) || 0,
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
