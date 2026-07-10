/**
 * Shared API types for Fitnexia clients (mobile, web).
 * Keep in sync with docs/openapi.yaml and docs/API.md
 */

export type UserRole = 'athlete' | 'instructor' | 'institution';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type VerificationRequestStatus = 'pending' | 'approved' | 'rejected';

export type ClassFormat = 'individual' | 'group';

export type Modality = 'in_person' | 'online';

export type ClassLevel = 'beginner' | 'intermediate' | 'advanced';

/** F-11 — instructor gender (backend `instructor_gender` enum) */
export type InstructorGender = 'female' | 'male' | 'other' | 'prefer_not_to_say';

export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'cancelled'
  | 'refunded'
  | 'completed'
  | 'no_show';

export type PaymentModel = 'per_class' | 'monthly_unlimited' | 'per_period';

/** F-23 — billing cadence when paymentModel is per_period */
export type BillingPeriod = 'weekly' | 'monthly' | 'quarterly';

export type InstructorPlan = 'basic' | 'pro' | 'institutional';

/** Fitnexia SaaS tier for gyms/clubs */
export type GymSaasTier = 'basic' | 'professional' | 'premium' | 'enterprise';

export type OpeningHoursDayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface OpeningHoursDay {
  closed?: boolean;
  open?: string;
  close?: string;
}

export type OpeningHours = Partial<Record<OpeningHoursDayKey, OpeningHoursDay>>;

export interface GymEntitlements {
  manualPayments: boolean;
  clubProfile: boolean;
  jobPostings: boolean;
  recurringBilling: boolean;
  reportsBasic: boolean;
  prioritySupport: boolean;
  branding: boolean;
  reportsAdvanced: boolean;
  activities: boolean;
  integrations: boolean;
}

export interface GymSubscription {
  tier: GymSaasTier;
  tierName: string;
  monthlyFeeCents: number;
  memberCount: number;
  memberLimit: number | null;
  membersRemaining: number | null;
  atLimit: boolean;
  entitlements: GymEntitlements;
  billingStatus: 'manual' | string;
}

export interface GymTierCatalog {
  id: GymSaasTier;
  name: string;
  monthlyFeeCents: number;
  memberLimit: number | null;
  entitlements: GymEntitlements;
}

export type JobRoleType = 'instructor' | 'trainer' | 'staff';
export type JobStatus = 'draft' | 'open' | 'closed';

export interface JobPosting {
  id: string;
  institutionId: string;
  institutionName: string;
  institutionLogoUrl?: string;
  title: string;
  roleType: JobRoleType;
  description?: string;
  disciplines: string[];
  status: JobStatus;
  expiresAt?: string | null;
  applicationCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  instructorId: string;
  instructorName?: string;
  instructorPhotoUrl?: string;
  message?: string;
  status: string;
  jobTitle?: string;
  jobStatus?: JobStatus;
  institutionName?: string;
  createdAt: string;
}

export type ClientPlatform = 'web' | 'ios' | 'android';

export interface Money {
  /** Amount in minor units (cents) */
  amount: number;
  currency: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AthleteProfile {
  firstName: string;
  lastName: string;
  photoUrl?: string;
  favoriteSports: string[];
  locale?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  year: number;
}

export interface Instructor {
  id: string;
  userId: string;
  displayName: string;
  photoUrl?: string;
  bio?: string;
  disciplines: string[];
  certifications?: Certification[];
  hourlyRate?: Money;
  verified: boolean;
  verificationStatus?: VerificationStatus;
  availableNow: boolean;
  averageRating: number;
  reviewCount: number;
  plan?: InstructorPlan;
  gender?: InstructorGender;
}

export interface InstitutionLocation {
  address: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  address: string;
  city: string;
  country: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  amount: Money;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

export interface Institution {
  id: string;
  name: string;
  logoUrl?: string;
  description?: string;
  location?: InstitutionLocation;
  gallery?: string[];
  verified: boolean;
  verificationStatus?: VerificationStatus;
  plan?: InstructorPlan;
  saasTier?: GymSaasTier;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  openingHours?: OpeningHours;
  instructors?: Pick<Instructor, 'id' | 'displayName'>[];
}

export interface ClassRecurrence {
  enabled: boolean;
  frequency: 'weekly';
  weekdays: number[];
  /** Omitted or null = indefinite series (F-13) */
  until?: string | null;
  paused?: boolean;
  seriesId?: string;
}

/** 0 = Sunday … 6 = Saturday */
export interface WeeklyDaySchedule {
  weekday: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export type WeeklySchedule = WeeklyDaySchedule[];

export interface ClassListItem {
  id: string;
  title: string;
  discipline: string;
  modality: Modality;
  startAt: string;
  durationMinutes: number;
  price: Money;
  capacity?: number;
  spotsLeft?: number;
  instructor?: (Pick<Instructor, 'id' | 'displayName' | 'photoUrl'> & {
    verified?: boolean;
    gender?: InstructorGender;
  }) | null;
  institution?: (Pick<Institution, 'id' | 'name'> & { verified?: boolean; logoUrl?: string }) | null;
  location?: { lat: number; lng: number; label: string };
  averageRating?: number;
  classFormat?: ClassFormat;
  /** F-11 — optional on list items when returned by search API */
  level?: ClassLevel;
  language?: string;
  /** F-13 — recurrence metadata when part of a weekly series */
  recurrence?: ClassRecurrence;
  /** F-17 — hours before class start for full refund on athlete cancel */
  cancellationPolicyHours?: number;
  /** Backend field on class instances belonging to a series */
  seriesId?: string;
  recurrenceSeriesId?: string;
  isSeriesException?: boolean;
}

/** F-13 — weekly class series managed by the backend */
export type ClassSeriesStatus = 'active' | 'paused' | 'deleted';

export interface ClassSeries {
  id: string;
  title: string;
  description?: string;
  discipline: string;
  modality: Modality;
  classFormat?: ClassFormat;
  status: ClassSeriesStatus;
  weekdays: number[];
  timeOfDay: string;
  anchorStartAt: string;
  durationMinutes: number;
  price: Money;
  capacity?: number;
  instructorId: string;
  institutionId?: string;
  pausedAt?: string;
  deletedAt?: string;
}

export interface ClassSeriesInstance {
  id: string;
  startAt: string;
}

export interface Class extends ClassListItem {
  description?: string;
  level?: ClassLevel;
  language?: string;
  recurrence?: ClassRecurrence;
}

export interface CreateBookingRequest {
  classId: string;
  paymentModel: PaymentModel;
  /** Required when paymentModel is per_period (F-23) */
  billingPeriod?: BillingPeriod;
  useCredits?: boolean;
  promoCode?: string | null;
}

export interface BookingPaymentOption {
  paymentModel: PaymentModel;
  billingPeriod?: BillingPeriod;
  label: string;
  description: string;
  price: Money;
  /** When true the athlete already has coverage (e.g. active monthly pass) */
  coveredBySubscription?: boolean;
}

export interface ClassBookingPaymentOptions {
  classId: string;
  options: BookingPaymentOption[];
  currency: string;
}

export interface Booking {
  id: string;
  status: BookingStatus;
  classId: string;
  userId: string;
  price: Money;
  paymentModel?: PaymentModel;
  billingPeriod?: BillingPeriod;
  createdAt: string;
}

export interface CreateBookingResponse {
  booking: Booking;
  payment?: {
    provider: 'mercado_pago';
    preferenceId: string;
    checkoutUrl: string;
  };
  loyaltyRedemption?: boolean;
}

export interface Review {
  id: string;
  classId: string;
  instructorId: string;
  userId: string;
  rating: number;
  comment?: string;
  authorName: string;
  response?: string | null;
  createdAt: string;
  verified: boolean;
}

/** Verified review from a gym that employs the instructor */
export interface StaffReview {
  id: string;
  instructorId: string;
  institutionId: string;
  institutionName: string;
  rating: number;
  comment?: string;
  createdAt: string;
  verified: true;
}

export interface CreditBalance {
  balance: number;
  creditsUntilReward: number;
  expiresAt?: string | null;
  lastBookingAt?: string | null;
  freeClassEligible: boolean;
  maxFreeClassValue: Money;
  creditsForReward?: number;
}

export type LoyaltyTransactionType = 'earn' | 'redeem' | 'expire' | 'adjust';

export interface LoyaltyTransaction {
  id: string;
  type: LoyaltyTransactionType;
  amount: number;
  balanceAfter: number;
  bookingId?: string;
  note?: string;
  createdAt: string;
}

/** F-37 — platform support tickets (API.md §14) */
export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved';

export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateSupportTicketRequest {
  subject: string;
  message: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

export interface HomeFeed {
  recommended: ClassListItem[];
  nearby: ClassListItem[];
  popular: ClassListItem[];
}

/** F-39 — club member fee status */
export type ClubMemberFeeStatus = 'current' | 'pending' | 'overdue';

/** F-40 — club-defined membership plan cadence */
export type ClubPlanCadence = 'monthly' | 'quarterly' | 'annual';

export interface ClubMembershipPlan {
  id: string;
  institutionId: string;
  name: string;
  cadence: ClubPlanCadence;
  price: Money;
  familySlots?: number;
  active: boolean;
  memberCount?: number;
}

export interface ClubMember {
  id: string;
  institutionId: string;
  userId?: string | null;
  email: string;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  phone?: string | null;
  planId: string;
  planName?: string;
  feeStatus: ClubMemberFeeStatus;
  nextDueAt?: string | null;
  subscriptionStatus?: 'none' | 'active' | 'past_due' | 'cancelled';
  joinedAt: string;
  leftAt?: string | null;
}

export interface ClubMembershipCharge {
  id: string;
  memberId: string;
  amount: Money;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  periodStart: string;
  periodEnd: string;
  mpPaymentId?: string | null;
  createdAt: string;
}

export interface ClubMemberInvite {
  id: string;
  email?: string | null;
  code: string;
  planId: string;
  planName?: string;
  status: 'pending' | 'accepted' | 'expired';
  inviteUrl?: string;
  sentAt: string;
  expiresAt?: string | null;
}

export interface ClubInvitePreview {
  code: string;
  institutionId: string;
  institutionName: string;
  plan: Pick<ClubMembershipPlan, 'id' | 'name' | 'cadence' | 'price'>;
  expiresAt?: string | null;
  valid: boolean;
}

export interface ClubMembersSummary {
  total: number;
  current: number;
  pending: number;
  overdue: number;
  collectionRate?: number;
}

/** F-45 — club collections panel (`GET /institutions/me/members/collections`) */
export interface ClubCollectionsPanel {
  summary: {
    upToDate: number;
    pending: number;
    overdue: number;
    total: number;
  };
  month: {
    collected: Money;
    expected: Money;
    collectionRate: number;
    paymentsCount: number;
    pendingCount: number;
    failedCount: number;
  };
  dailyCollections: { date: string; collectedCents: number }[];
}

/** F-47 — court / space management */
export type CourtSportType =
  | 'padel'
  | 'tennis'
  | 'football_5'
  | 'football_7'
  | 'football_11'
  | 'rugby'
  | 'other';

export type CourtSurface = 'grass' | 'synthetic' | 'clay' | 'hard' | 'other';

export type CourtLocationType = 'indoor' | 'outdoor';

export type CourtWeekdayKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export interface CourtDayHours {
  open?: string;
  close?: string;
  closed?: boolean;
}

export type CourtOperatingHours = Partial<Record<CourtWeekdayKey, CourtDayHours>>;

export interface Court {
  id: string;
  institutionId: string;
  name: string;
  sportType: CourtSportType | string;
  surface: CourtSurface | string;
  locationType: CourtLocationType | string;
  hasLighting: boolean;
  operatingHours: CourtOperatingHours;
  active: boolean;
  createdAt: string;
}

export interface CreateCourtRequest {
  name: string;
  sportType?: CourtSportType | string;
  surface?: CourtSurface | string;
  locationType?: CourtLocationType | string;
  hasLighting?: boolean;
  operatingHours?: CourtOperatingHours;
}

export interface UpdateCourtRequest {
  name?: string;
  sportType?: CourtSportType | string;
  surface?: CourtSurface | string;
  locationType?: CourtLocationType | string;
  hasLighting?: boolean;
  operatingHours?: CourtOperatingHours;
  active?: boolean;
}

export interface CourtSettings {
  cancellationPolicyHours: number;
  defaultSlotMinutes: number;
}

/** F-48 — per-court availability schedule */
export interface CourtScheduleSlot {
  startAt: string;
  endAt: string;
  available: boolean;
}

export interface CourtScheduleDay {
  court: Court;
  date: string;
  slotMinutes: number;
  slots: CourtScheduleSlot[];
}

export type CourtReservationStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'cancelled'
  | 'expired'
  | 'completed';

export interface CourtReservation {
  id: string;
  courtId: string;
  institutionId: string;
  courtName?: string;
  institutionName?: string;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  status: CourtReservationStatus | string;
  price: Money;
  isMemberRate?: boolean;
  createdAt: string;
  cancellationPolicyHours?: number;
  canCancel?: boolean;
  refundEligible?: boolean;
}

/** F-50 — peak / member pricing rules */
export interface CourtPricingRule {
  id: string;
  institutionId: string;
  courtId?: string;
  label: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  isPeak: boolean;
  isWeekend: boolean;
  memberPrice: Money;
  nonMemberPrice: Money;
  priority: number;
  active: boolean;
}

export interface CreateCourtPricingRuleRequest {
  courtId?: string | null;
  label?: string;
  daysOfWeek?: number[];
  startTime?: string;
  endTime?: string;
  isPeak?: boolean;
  isWeekend?: boolean;
  memberPrice: Money;
  nonMemberPrice: Money;
  priority?: number;
}

/** F-49 / F-50 — quote for a court slot */
export interface CourtQuoteRequest {
  courtId: string;
  startAt: string;
  durationMinutes?: number;
}

export interface CourtQuoteResponse {
  memberPrice: Money;
  nonMemberPrice: Money;
  appliedPrice: Money;
  isMemberRate: boolean;
  durationMinutes: number;
  slotMinutes: number;
  cancellationPolicyHours: number;
}

export interface CreateCourtReservationRequest {
  courtId: string;
  startAt: string;
  durationMinutes: number;
  recurringShiftId?: string;
}

export interface CreateCourtReservationResponse {
  reservation: CourtReservation;
  checkoutUrl?: string;
  paymentRequired?: boolean;
}

/** F-51 — weekly fixed shifts */
export interface CourtRecurringShift {
  id: string;
  courtId: string;
  institutionId: string;
  courtName?: string;
  institutionName?: string;
  weekday: number;
  weekdayLabel: string;
  startTime: string;
  durationMinutes: number;
  label: string;
  groupLabel?: string;
  active: boolean;
  nextOccurrenceAt?: string | null;
  lastGeneratedAt?: string | null;
  createdAt: string;
}

export interface CreateCourtRecurringShiftRequest {
  courtId: string;
  weekday: number;
  startTime: string;
  durationMinutes: number;
  label?: string;
  groupLabel?: string;
}

/** F-53 — open games / find players */
export type OpenGameSport = 'padel' | 'football_5' | 'football_7' | 'football_11';

export type OpenGameStatus = 'open' | 'full' | 'cancelled' | 'completed';

export interface OpenGameParticipant {
  userId: string;
  firstName?: string;
  lastName?: string;
  avatarUri?: string;
  joinedAt: string;
}

export interface OpenGame {
  id: string;
  creatorUserId: string;
  sportType: OpenGameSport | string;
  title: string;
  description?: string;
  startAt: string;
  durationMinutes: number;
  locationLabel?: string;
  latitude?: number;
  longitude?: number;
  institutionId?: string;
  courtId?: string;
  institutionName?: string;
  capacity: number;
  spotsLeft: number;
  joinedCount: number;
  level?: string;
  status: OpenGameStatus | string;
  isCreator?: boolean;
  myStatus?: string | null;
  participants: OpenGameParticipant[];
  createdAt: string;
}

export interface CreateOpenGameRequest {
  sportType: OpenGameSport | string;
  title: string;
  startAt: string;
  capacity: number;
  description?: string;
  durationMinutes?: number;
  locationLabel?: string;
  latitude?: number;
  longitude?: number;
  institutionId?: string;
  courtId?: string;
  level?: string;
}

export interface ClubMembershipStatement {
  institutionId: string;
  institutionName: string;
  membershipId: string;
  plan: Pick<ClubMembershipPlan, 'id' | 'name' | 'cadence' | 'price'>;
  feeStatus: ClubMemberFeeStatus;
  balanceDue: Money;
  nextDueAt?: string | null;
  subscriptionStatus?: 'none' | 'active' | 'past_due' | 'cancelled';
  charges: ClubMembershipCharge[];
}

export interface AthleteClubMembership {
  id: string;
  institutionId: string;
  institutionName: string;
  planName: string;
  feeStatus: ClubMemberFeeStatus;
  nextDueAt?: string | null;
  subscriptionStatus?: 'none' | 'active' | 'past_due' | 'cancelled';
}

/** F-40/F-41 — institution membership billing configuration */
export interface MembershipBillingSettings {
  reminderDaysBeforeDue?: number;
  graceDays?: number;
}

export interface AcceptMembershipInviteResponse {
  memberId: string;
  member?: ClubMember;
  checkoutUrl?: string;
  authorizationUrl?: string;
  subscriptionId?: string;
}

export interface MembershipPaymentResponse {
  checkoutUrl?: string;
  authorizationUrl?: string;
  paymentId?: string;
  preapprovalId?: string;
}

/** F-35 — metrics & analytics */
export type MetricsPeriod = 'day' | 'week' | 'month';

export interface MetricsDailyPoint {
  date: string;
  bookings: number;
  revenueCents: number;
}

export interface MetricsTopClass {
  title: string;
  bookings: number;
  revenueCents: number;
  occupancyRate: number;
}

export interface MetricsTopInstructor {
  name: string;
  bookings: number;
  revenueCents: number;
}

export interface InstructorMetrics {
  period: MetricsPeriod;
  bookings: number;
  revenue: Money;
  occupancyRate: number;
  daily?: MetricsDailyPoint[];
  topClasses: MetricsTopClass[];
}

export interface InstitutionMetrics extends InstructorMetrics {
  retentionRate: number;
  daily: MetricsDailyPoint[];
  topInstructors: MetricsTopInstructor[];
}

/** F-14 — live class stream session status */
export type ClassStreamSessionStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';

export type ClassStreamRole = 'host' | 'participant';

export interface ClassStreamStatusResponse {
  id: string;
  classId: string;
  roomName: string;
  status: ClassStreamSessionStatus;
  startedAt?: string | null;
  endedAt?: string | null;
  hostUserId?: string;
  livekitConfigured: boolean;
  withinJoinWindow: boolean;
  canJoin: boolean;
  role: ClassStreamRole | null;
  classTitle?: string;
  classStartAt?: string;
  classDurationMinutes?: number;
}

export interface ClassStreamJoinResponse extends ClassStreamStatusResponse {
  token: string;
  url: string;
  canPublish: boolean;
  identity: string;
  displayName: string;
}

/** Default API base — override per environment */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.EXPO_PUBLIC_API_URL ??
  'https://svganchordev.net/fitnexia-api/v1';

  // 'http://localhost:3001/v1';
