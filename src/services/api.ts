import { apiRequest, getAccessToken } from '@/services/api-client';
import { API_BASE_URL } from '@/types/api';
import type {
  AthleteProfile,
  AuthResponse,
  Booking,
  Class,
  ClassBookingPaymentOptions,
  ClassListItem,
  CreateBookingRequest,
  CreateBookingResponse,
  HomeFeed,
  Institution,
  Instructor,
  PaginatedResponse,
  User,
  UserRole,
} from '@/types/api';
import { buildFallbackPaymentOptions } from '@/utils/booking-payments';
import type { NotificationPreferences } from '@/contexts/auth-context';

export interface MeResponse {
  user: User;
  profile: AthleteProfile | Instructor | Institution | null;
}

export interface RegisterBody {
  email: string;
  password: string;
  role: Exclude<UserRole, 'admin'>;
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
  role?: Exclude<UserRole, 'admin'>;
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
  return apiRequest<Institution>(`/institutions/${id}`);
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
    return await apiRequest<ClassBookingPaymentOptions>(
      `/classes/${classItem.id}/booking-payment-options`,
      { auth: false },
    );
  } catch {
    return buildFallbackPaymentOptions(classItem);
  }
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

export async function apiDownloadPayoutsCsv(): Promise<Blob> {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE_URL}/payouts/me/export.csv`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: { message?: string } })?.error?.message ?? 'No se pudo exportar',
    );
  }
  return res.blob();
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
