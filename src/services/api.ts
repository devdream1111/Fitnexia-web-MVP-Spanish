import { apiFetchAuthenticatedBlob, apiRequest } from '@/services/api-client';
import { API_BASE_URL } from '@/types/api';
import type {
  AthleteProfile,
  AuthResponse,
  Booking,
  Class,
  ClassBookingPaymentOptions,
  ClassListItem,
  ClubInvitePreview,
  ClubMember,
  ClubMemberFeeStatus,
  ClubMemberInvite,
  ClubMembershipCharge,
  ClubMembershipPlan,
  ClubMembershipStatement,
  ClubMembersSummary,
  ClubPlanCadence,
  AthleteClubMembership,
  AcceptMembershipInviteResponse,
  MembershipBillingSettings,
  MembershipPaymentResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  GymSaasTier,
  GymSubscription,
  GymTierCatalog,
  HomeFeed,
  Institution,
  Instructor,
  JobApplication,
  JobPosting,
  JobRoleType,
  JobStatus,
  Money,
  PaginatedResponse,
  User,
  UserRole,
} from '@/types/api';
import { buildFallbackPaymentOptions } from '@/utils/booking-payments';
import {
  feeStatusToBackendQuery,
  filterClubMembersLocally,
  normalizeAthleteMembershipsList,
  normalizeBillingSettings,
  normalizeClubMember,
  normalizeClubMembersList,
  normalizeInvitePreview,
  normalizeMembershipStatement,
  normalizePlanList,
  normalizeUpdatedClubMember,
  paginateLocally,
  toBackendBillingSettingsPatch,
  toBackendMemberBody,
  toBackendPlanBody,
  toBackendPlanPatch,
} from '@/utils/club-members';
import type { NotificationPreferences } from '@/contexts/auth-context';

export interface MeResponse {
  user: User;
  profile: AthleteProfile | Instructor | Institution | null;
}

export interface RegisterBody {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  favoriteSports?: string[];
  disciplines?: string[];
  institutionName?: string;
  photoUrl?: string;
  acceptTerms?: boolean;
}

export interface BookingRecord extends Booking {
  checkoutUrl?: string;
  paymentId?: string;
  /** Populated by some API responses — used for calendar without an extra class fetch */
  class?: ClassListItem;
}

export interface ReviewEligibility {
  eligible: boolean;
  bookingId: string;
  status: string;
  alreadyReviewed: boolean;
  reason?: string;
}

export interface ApiReview {
  id: string;
  rating: number;
  comment?: string;
  authorName: string;
  createdAt: string;
}

export interface StaffReviewRecord {
  id: string;
  instructorId: string;
  institutionId: string;
  institutionName: string;
  rating: number;
  comment?: string;
  createdAt: string;
  verified: boolean;
}

export interface LinkedInstructor {
  id: string;
  displayName: string;
  disciplines: string[];
  verified: boolean;
  averageRating: number;
  reviewCount: number;
}

export type StaffStatus = 'none' | 'linked' | 'pending';

export interface StaffRosterItem {
  id: string;
  displayName: string;
  photoUrl?: string;
  disciplines: string[];
  verified: boolean;
  averageRating: number;
  reviewCount: number;
  staffStatus: StaffStatus;
  inviteId?: string;
  hasCompletedClass: boolean;
  staffReview: { id: string; rating: number } | null;
  canLeaveStaffReview: boolean;
}

export interface InstructorGymInvite {
  id: string;
  institutionId: string;
  institutionName: string;
  message?: string | null;
  status: string;
  sentAt: string;
}

export interface StaffReviewEligibility {
  linked: boolean;
  hasCompletedClass: boolean;
  canLeaveReview: boolean;
  existingReview: {
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
  } | null;
}

export interface PayoutSummary {
  gross: number;
  platformFee: number;
  net: number;
  currency: string;
  commissionRate: number;
  plan: string;
}

export interface PayoutRecord {
  id: string;
  bookingId: string;
  classTitle: string;
  amount: { amount: number; currency: string };
  gross: { amount: number; currency: string };
  status: string;
  createdAt: string;
}

export interface AppConfig {
  minAppVersion: { ios: string; android: string };
  features: {
    googleSignIn: boolean;
    geolocationMap: boolean;
    integratedPayments: boolean;
    waitlist: boolean;
    loyaltyCredits: boolean;
    subscriptionPaymentModels?: boolean;
  };
  currency: string;
}

export interface PaymentsConfig {
  enabled: boolean;
  currency: string;
  provider: string;
}

export interface ClassSearchParams {
  q?: string;
  discipline?: string;
  modality?: string;
  priceMin?: number;
  priceMax?: number;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  price: { amount: number; currency: string };
  startAt: string;
}

export interface CreateClassBody {
  title: string;
  description?: string;
  discipline: string;
  modality: string;
  classFormat?: string;
  startAt: string;
  durationMinutes: number;
  price: { amount: number; currency: string };
  capacity?: number;
  cancellationPolicyHours?: number;
  location?: { lat: number; lng: number; label: string };
  instructorId?: string;
  institutionId?: string;
}

// --- Auth ---

export function apiRegister(body: RegisterBody) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ ...body, acceptTerms: body.acceptTerms ?? true }),
  });
}

export function apiLogin(email: string, password: string) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, password }),
  });
}

export interface GoogleOAuthBody {
  idToken: string;
  role?: UserRole;
  institutionName?: string;
}

export function apiGoogleOAuth(body: GoogleOAuthBody) {
  return apiRequest<AuthResponse>('/auth/oauth/google', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(body),
  });
}

export function apiLogout(refreshToken: string) {
  return apiRequest<void>('/auth/logout', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ refreshToken }),
  });
}

export function apiForgotPassword(email: string) {
  return apiRequest<{ sent: boolean; found: boolean }>('/auth/forgot-password', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email }),
  });
}

export function apiGetMe() {
  return apiRequest<MeResponse>('/auth/me');
}

// --- Athlete profile ---

export function apiGetAthleteProfile() {
  return apiRequest<AthleteProfile>('/users/me/profile');
}

export function apiUpdateAthleteProfile(body: Partial<AthleteProfile>) {
  return apiRequest<AthleteProfile>('/users/me/profile', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function apiUpdateUserEmail(email: string) {
  return apiRequest<User>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify({ email }),
  });
}

// --- Instructor ---

export function apiGetInstructorMe() {
  return apiRequest<Instructor>('/instructors/me');
}

export function apiGetInstructor(id: string) {
  return apiRequest<Instructor>(`/instructors/${id}`);
}

export function apiUpdateInstructor(body: Record<string, unknown>) {
  return apiRequest<Instructor>('/instructors/me', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function apiSetAvailableNow(availableNow: boolean) {
  return apiRequest<{ availableNow: boolean }>('/instructors/me/availability-now', {
    method: 'PATCH',
    body: JSON.stringify({ availableNow }),
  });
}

// --- Institution ---

export function apiGetInstitutionMe() {
  return apiRequest<Institution>('/institutions/me');
}

export function apiGetInstitution(id: string) {
  return apiRequest<Institution>(`/institutions/${id}`, { auth: false });
}

export function apiUpdateInstitution(body: Record<string, unknown>) {
  return apiRequest<Institution>('/institutions/me', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function apiListLinkedInstructors() {
  return apiRequest<{ data: LinkedInstructor[] }>('/institutions/me/instructors');
}

export function apiGetStaffRoster() {
  return apiRequest<{ data: StaffRosterItem[] }>('/institutions/me/instructors/roster');
}

export function apiInviteInstructor(body: { instructorId?: string; email?: string; message?: string }) {
  return apiRequest<{
    id: string;
    email: string;
    message?: string;
    status: string;
    sentAt: string;
  }>('/institutions/me/instructors/invite', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function apiCancelInstructorInvite(inviteId: string) {
  return apiRequest<void>(`/institutions/me/instructors/invites/${inviteId}`, {
    method: 'DELETE',
  });
}

export function apiListGymInvites() {
  return apiRequest<{
    data: { id: string; email: string; message?: string; status: string; sentAt: string }[];
  }>('/institutions/me/instructors/invites');
}

export function apiGetInstructorInvites() {
  return apiRequest<{ data: InstructorGymInvite[] }>('/instructors/me/invites');
}

export function apiAcceptInstructorInvite(inviteId: string) {
  return apiRequest<{ institutionId: string; institutionName: string }>(
    `/instructors/me/invites/${inviteId}/accept`,
    { method: 'POST' },
  );
}

export function apiUnlinkInstructor(instructorId: string) {
  return apiRequest<void>(`/institutions/me/instructors/${instructorId}`, {
    method: 'DELETE',
  });
}

export function apiCreateStaffReview(body: { instructorId: string; rating: number; comment?: string }) {
  return apiRequest<StaffReviewRecord>('/institutions/me/staff-reviews', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function apiGetStaffReviewEligibility(instructorId: string) {
  return apiRequest<StaffReviewEligibility>(
    `/institutions/me/instructors/${instructorId}/review-eligibility`,
  );
}

// --- Classes ---

export function apiSearchClasses(params: ClassSearchParams = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  const query = qs.toString();
  return apiRequest<PaginatedResponse<ClassListItem>>(
    `/classes/search${query ? `?${query}` : ''}`,
    { auth: false },
  );
}

export function apiGetClassMapMarkers(params: ClassSearchParams = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  const query = qs.toString();
  return apiRequest<{ data: MapMarker[] }>(`/classes/map${query ? `?${query}` : ''}`, {
    auth: false,
  });
}

export function apiGetClass(id: string) {
  return apiRequest<Class>(`/classes/${id}`, { auth: false });
}

export async function apiGetClassBookingPaymentOptions(
  classItem: ClassListItem,
): Promise<ClassBookingPaymentOptions> {
  try {
    const products = await apiGetPassProducts();
    return buildPaymentOptionsFromPassProducts(classItem, products);
  } catch {
    return buildFallbackPaymentOptions(classItem);
  }
}

export interface PassProductsConfig {
  monthly_unlimited: {
    id: string;
    paymentModel: string;
    name: string;
    price: { amount: number; currency: string };
  };
  per_period: Record<
    string,
    {
      periodType: string;
      name: string;
      price: { amount: number; currency: string };
      classCredits?: number;
    }
  >;
}

export function apiGetPassProducts() {
  return apiRequest<PassProductsConfig>('/config/pass-products', { auth: false });
}

function buildPaymentOptionsFromPassProducts(
  cls: ClassListItem,
  products: PassProductsConfig,
): ClassBookingPaymentOptions {
  const currency = cls.price.currency;
  const options: ClassBookingPaymentOptions['options'] = [
    {
      paymentModel: 'per_class',
      label: 'Pago por clase',
      description: 'Pagá solo esta clase al confirmar la reserva.',
      price: cls.price,
    },
  ];

  if (products.monthly_unlimited) {
    options.push({
      paymentModel: 'monthly_unlimited',
      label: products.monthly_unlimited.name,
      description: 'Acceso ilimitado a clases durante 30 días.',
      price: products.monthly_unlimited.price,
    });
  }

  for (const [period, product] of Object.entries(products.per_period ?? {})) {
    options.push({
      paymentModel: 'per_period',
      billingPeriod: period as import('@/types/api').BillingPeriod,
      label: product.name,
      description: `${product.classCredits ?? ''} créditos de clase`.trim(),
      price: product.price,
    });
  }

  return { classId: cls.id, currency, options };
}

export function apiGetMyClasses() {
  return apiRequest<{ data: ClassListItem[] }>('/classes/mine');
}

export function apiCreateClass(body: CreateClassBody) {
  return apiRequest<Class>('/classes', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function apiUpdateClass(id: string, body: Partial<CreateClassBody>) {
  return apiRequest<Class>(`/classes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function apiCancelClass(id: string) {
  return apiRequest<void>(`/classes/${id}/cancel`, { method: 'POST' });
}

// --- Feed ---

export function apiGetHomeFeed() {
  return apiRequest<HomeFeed>('/feed/home', { auth: false });
}

// --- Bookings ---

export function apiCreateBooking(body: CreateBookingRequest) {
  return apiRequest<CreateBookingResponse>('/bookings', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function apiGetMyBookings() {
  return apiRequest<{ data: BookingRecord[] }>('/bookings/me');
}

export function apiGetBooking(id: string) {
  return apiRequest<BookingRecord>(`/bookings/${id}`);
}

export function apiCancelBooking(id: string) {
  return apiRequest<BookingRecord>(`/bookings/${id}/cancel`, { method: 'POST' });
}

export function apiSyncBookingPayment(id: string) {
  return apiRequest<BookingRecord>(`/bookings/${id}/sync-payment`, { method: 'POST' });
}

export function apiGetReviewEligibility(bookingId: string) {
  return apiRequest<ReviewEligibility>(`/bookings/${bookingId}/review-eligibility`);
}

// --- Reviews ---

export function apiCreateReview(body: { bookingId: string; rating: number; comment?: string }) {
  return apiRequest<{ id: string; rating: number; comment?: string; createdAt: string }>(
    '/reviews',
    { method: 'POST', body: JSON.stringify(body) },
  );
}

export function apiGetInstructorReviews(instructorId: string) {
  return apiRequest<{ data: ApiReview[] }>(`/instructors/${instructorId}/reviews`, {
    auth: false,
  });
}

export function apiGetStaffReviews(instructorId: string) {
  return apiRequest<{ data: StaffReviewRecord[] }>(`/instructors/${instructorId}/staff-reviews`, {
    auth: false,
  });
}

// --- Payouts ---

export function apiGetPayoutSummary(period: 'day' | 'week' | 'month' = 'month') {
  return apiRequest<PayoutSummary>(`/payouts/me/summary?period=${period}`);
}

export function apiListPayouts(params: { page?: number; limit?: number } = {}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const query = qs.toString();
  return apiRequest<PaginatedResponse<PayoutRecord>>(
    `/payouts/me${query ? `?${query}` : ''}`,
  );
}

export function apiDownloadPayoutsCsv(): Promise<Blob> {
  return apiFetchAuthenticatedBlob('/payouts/me/export.csv');
}

export interface PlanOption {
  id: string;
  name: string;
  monthlyFeeCents: number;
  commissionPercent: number;
}

export function apiGetPlans() {
  return apiRequest<{ data: PlanOption[] }>('/config/plans', { auth: false });
}

// --- Gym SaaS subscription ---

export function apiGetGymTiers() {
  return apiRequest<{ data: GymTierCatalog[] }>('/config/gym-tiers', { auth: false });
}

export function apiGetGymSubscription() {
  return apiRequest<GymSubscription>('/institutions/me/subscription');
}

export function apiUpdateGymSubscription(tier: GymSaasTier) {
  return apiRequest<GymSubscription>('/institutions/me/subscription', {
    method: 'PATCH',
    body: JSON.stringify({ tier }),
  });
}

// --- Manual member payments ---

export async function apiMarkClubMemberPaid(id: string) {
  const raw = await apiRequest<unknown>(`/institutions/me/members/${id}/mark-paid`, {
    method: 'POST',
  });
  return normalizeClubMember(raw)!;
}

export async function apiMarkClubMemberPending(id: string) {
  const raw = await apiRequest<unknown>(`/institutions/me/members/${id}/mark-pending`, {
    method: 'POST',
  });
  return normalizeClubMember(raw)!;
}

// --- Job postings (gym) ---

export function apiListGymJobs() {
  return apiRequest<{ data: JobPosting[] }>('/institutions/me/jobs');
}

export function apiGetGymJob(id: string) {
  return apiRequest<JobPosting>(`/institutions/me/jobs/${id}`);
}

export function apiCreateGymJob(body: {
  title: string;
  roleType?: JobRoleType;
  description?: string;
  disciplines?: string[];
  status?: JobStatus;
  expiresAt?: string | null;
}) {
  return apiRequest<JobPosting>('/institutions/me/jobs', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function apiUpdateGymJob(
  id: string,
  body: Partial<{
    title: string;
    roleType: JobRoleType;
    description: string;
    disciplines: string[];
    status: JobStatus;
    expiresAt: string | null;
  }>,
) {
  return apiRequest<JobPosting>(`/institutions/me/jobs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function apiDeleteGymJob(id: string) {
  return apiRequest<void>(`/institutions/me/jobs/${id}`, { method: 'DELETE' });
}

export function apiListJobApplications(jobId: string) {
  return apiRequest<{ data: JobApplication[] }>(`/institutions/me/jobs/${jobId}/applications`);
}

// --- Job postings (public / instructor) ---

export function apiListOpenJobs(q?: string) {
  const qs = q ? `?q=${encodeURIComponent(q)}` : '';
  return apiRequest<{ data: JobPosting[] }>(`/jobs${qs}`, { auth: false });
}

export function apiGetOpenJob(id: string) {
  return apiRequest<JobPosting>(`/jobs/${id}`, { auth: false });
}

export function apiApplyToJob(id: string, body: { message?: string } = {}) {
  return apiRequest<JobApplication>(`/jobs/${id}/apply`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function apiListMyJobApplications() {
  return apiRequest<{ data: JobApplication[] }>('/instructors/me/job-applications');
}

export interface PaymentDetail {
  id: string;
  bookingId: string;
  provider: string;
  status: string;
  amount: { amount: number; currency: string };
  checkoutUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export function apiGetPayment(paymentId: string) {
  return apiRequest<PaymentDetail>(`/payments/${paymentId}`);
}

// --- Club membership plans (F-40) ---

export function apiListClubMembershipPlans() {
  return apiRequest<{ data: ClubMembershipPlan[] }>('/institutions/me/membership-plans');
}

export function apiCreateClubMembershipPlan(body: {
  name: string;
  cadence: ClubPlanCadence;
  price: Money;
  familySlots?: number;
  active?: boolean;
}) {
  return apiRequest<ClubMembershipPlan>('/institutions/me/membership-plans', {
    method: 'POST',
    body: JSON.stringify(toBackendPlanBody(body)),
  }).then((raw) => normalizePlanList({ data: [raw] })[0]!);
}

export function apiUpdateClubMembershipPlan(
  id: string,
  body: Partial<{
    name: string;
    cadence: ClubPlanCadence;
    price: Money;
    familySlots: number;
    active: boolean;
  }>,
) {
  return apiRequest<ClubMembershipPlan>(`/institutions/me/membership-plans/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(toBackendPlanPatch(body)),
  }).then((raw) => normalizePlanList({ data: [raw] })[0]!);
}

export function apiDeactivateClubMembershipPlan(id: string) {
  return apiRequest<void>(`/institutions/me/membership-plans/${id}`, {
    method: 'DELETE',
  });
}

export async function apiGetMembershipBillingSettings() {
  const raw = await apiRequest<unknown>('/institutions/me/membership-settings');
  return normalizeBillingSettings(raw);
}

export async function apiUpdateMembershipBillingSettings(body: Partial<MembershipBillingSettings>) {
  const raw = await apiRequest<unknown>('/institutions/me/membership-settings', {
    method: 'PATCH',
    body: JSON.stringify(toBackendBillingSettingsPatch(body)),
  });
  return normalizeBillingSettings(raw);
}

// --- Club members (F-39) ---

export interface ListClubMembersParams {
  feeStatus?: ClubMemberFeeStatus;
  planId?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export async function apiListClubMembers(params: ListClubMembersParams = {}) {
  const qs = new URLSearchParams();
  const backendStatus = feeStatusToBackendQuery(params.feeStatus);
  if (backendStatus) qs.set('status', backendStatus);
  const query = qs.toString();

  const raw = await apiRequest<{ data: unknown[] }>(
    `/institutions/me/members${query ? `?${query}` : ''}`,
  );

  let members = normalizeClubMembersList(raw);

  if (params.planId || params.q || (params.feeStatus && !backendStatus)) {
    members = filterClubMembersLocally(members, {
      feeStatus: params.feeStatus,
      planId: params.planId,
      q: params.q,
    });
  }

  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const { items, meta } = paginateLocally(members, page, limit);

  return { data: items, meta } satisfies PaginatedResponse<ClubMember>;
}

export function apiGetClubMembersSummary() {
  return apiRequest<ClubMembersSummary>('/institutions/me/members/summary');
}

export async function apiCreateClubMember(body: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  planId: string;
}) {
  const raw = await apiRequest<unknown>('/institutions/me/members', {
    method: 'POST',
    body: JSON.stringify(toBackendMemberBody(body)),
  });
  return normalizeClubMember(raw)!;
}

export function apiRemoveClubMember(id: string) {
  return apiRequest<void>(`/institutions/me/members/${id}`, {
    method: 'DELETE',
  });
}

export async function apiGetClubMember(id: string): Promise<ClubMember | null> {
  try {
    const raw = await apiRequest<unknown>(`/institutions/me/members/${id}`);
    return normalizeClubMember(raw);
  } catch {
    return null;
  }
}

export async function apiUpdateClubMember(
  id: string,
  body: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    planId?: string;
  },
) {
  const raw = await apiRequest<unknown>(`/institutions/me/members/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(toBackendMemberBody(body)),
  });
  return normalizeUpdatedClubMember(raw) ?? normalizeClubMember(raw);
}

/** Prefer GET /members/{id}; fall back to paginated list scan. */
export async function apiFindClubMember(memberId: string): Promise<ClubMember | null> {
  const direct = await apiGetClubMember(memberId);
  if (direct) return direct;

  let page = 1;
  const limit = 100;
  while (page <= 20) {
    const res = await apiListClubMembers({ page, limit });
    const members = normalizeClubMembersList(res);
    const found = members.find((m) => m.id === memberId);
    if (found) return found;
    const totalPages = res.meta?.totalPages ?? 1;
    if (page >= totalPages || members.length === 0) break;
    page += 1;
  }
  return null;
}

// --- Membership invites (F-43) ---

export function apiCreateMembershipInvite(body: {
  planId: string;
  email?: string;
  message?: string;
}) {
  return apiRequest<ClubMemberInvite>('/institutions/me/membership-invites', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function apiListMembershipInvites() {
  return apiRequest<{ data: ClubMemberInvite[] }>('/institutions/me/membership-invites');
}

export function apiCancelMembershipInvite(id: string) {
  return apiRequest<void>(`/institutions/me/membership-invites/${id}`, {
    method: 'DELETE',
  });
}

export function apiBulkCreateMembershipInvites(file: File) {
  const form = new FormData();
  form.append('file', file);
  return apiRequest<{
    imported: number;
    failed: number;
    errors: { row: number; reason: string }[];
  }>('/institutions/me/membership-invites/bulk', {
    method: 'POST',
    body: form,
  });
}

export async function apiGetMembershipInvitePreview(code: string) {
  const raw = await apiRequest<unknown>(`/memberships/invites/${encodeURIComponent(code)}`, {
    auth: false,
  });
  const preview = normalizeInvitePreview(raw);
  if (!preview) throw new Error('Invalid invite preview');
  return preview;
}

function mapMembershipPaymentResponse(raw: unknown): MembershipPaymentResponse {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    checkoutUrl: (r.checkoutUrl ?? r.authorizationUrl) as string | undefined,
    authorizationUrl: r.authorizationUrl as string | undefined,
    paymentId: r.paymentId as string | undefined,
    preapprovalId: r.preapprovalId as string | undefined,
  };
}

export async function apiAcceptMembershipInvite(code: string) {
  const raw = await apiRequest<Record<string, unknown>>(
    `/memberships/invites/${encodeURIComponent(code)}/accept`,
    { method: 'POST' },
  );
  const member = normalizeClubMember(raw.member);
  const payment = mapMembershipPaymentResponse(raw);
  return {
    memberId: String(member?.id ?? raw.memberId ?? ''),
    member: member ?? undefined,
    checkoutUrl: payment.checkoutUrl ?? payment.authorizationUrl,
    authorizationUrl: payment.authorizationUrl,
    subscriptionId: raw.subscriptionId as string | undefined,
  } satisfies AcceptMembershipInviteResponse;
}

// --- Athlete memberships (F-41/F-42) ---

export function apiListMyClubMemberships() {
  return apiRequest<{ data: AthleteClubMembership[] }>('/memberships/me');
}

export async function apiGetMembershipStatement(memberId: string) {
  const raw = await apiRequest<unknown>(`/memberships/me/${memberId}/statement`);
  const statement = normalizeMembershipStatement(raw);
  if (!statement) throw new Error('Invalid membership statement');
  return statement;
}

export async function apiAuthorizeMembership(memberId: string) {
  const raw = await apiRequest<unknown>(`/memberships/me/${memberId}/authorize`, {
    method: 'POST',
  });
  return mapMembershipPaymentResponse(raw);
}

export async function apiPayMembershipDebt(memberId: string) {
  const raw = await apiRequest<unknown>(`/memberships/me/${memberId}/pay-debt`, {
    method: 'POST',
  });
  return mapMembershipPaymentResponse(raw);
}

export async function apiSyncMembershipPayment(memberId: string, paymentId: string) {
  return apiRequest<{ synced: boolean; status?: string }>(
    `/memberships/me/${memberId}/payments/${paymentId}/sync`,
    { method: 'POST' },
  );
}

// --- Legacy aliases (deprecated paths) ---
/** @deprecated Use apiRemoveClubMember */
export const apiDeactivateClubMember = apiRemoveClubMember;
/** @deprecated Use apiCreateMembershipInvite */
export const apiCreateClubMemberInvite = apiCreateMembershipInvite;
/** @deprecated Use apiListMembershipInvites */
export const apiListClubMemberInvites = apiListMembershipInvites;
/** @deprecated Use apiBulkCreateMembershipInvites */
export const apiBulkImportClubMembers = apiBulkCreateMembershipInvites;
/** @deprecated Use apiGetMembershipInvitePreview */
export const apiGetClubInvitePreview = apiGetMembershipInvitePreview;
/** @deprecated Use apiAcceptMembershipInvite */
export const apiAcceptClubInvite = apiAcceptMembershipInvite;
/** @deprecated Use apiGetMembershipStatement */
export const apiGetClubMembershipStatement = apiGetMembershipStatement;
/** @deprecated Use apiPayMembershipDebt */
export const apiPayClubMembershipBalance = apiPayMembershipDebt;

// --- Notifications preferences ---

export function apiGetNotificationPreferences() {
  return apiRequest<NotificationPreferences>('/notifications/preferences');
}

export function apiUpdateNotificationPreferences(body: Partial<NotificationPreferences>) {
  return apiRequest<NotificationPreferences>('/notifications/preferences', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

// --- Config ---

export function apiGetAppConfig() {
  return apiRequest<AppConfig>('/config/app', { auth: false });
}

export function apiGetPaymentsConfig() {
  return apiRequest<PaymentsConfig>('/config/payments', { auth: false });
}

export function apiGetDisciplines() {
  return apiRequest<{ data: string[] }>('/config/disciplines', { auth: false });
}

// --- Media ---

export async function apiUploadMedia(file: File): Promise<{ publicUrl: string }> {
  const form = new FormData();
  form.append('file', file);
  const result = await apiRequest<{ publicUrl: string }>('/media/upload', {
    method: 'POST',
    body: form,
    auth: false,
  });
  return { publicUrl: result.publicUrl };
}
