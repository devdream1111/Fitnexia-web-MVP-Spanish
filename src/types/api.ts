/**
 * Shared API types for Fitnexia clients (mobile, web).
 * Keep in sync with docs/openapi.yaml and docs/API.md
 */

export type UserRole = 'athlete' | 'instructor' | 'institution' | 'admin';

export type ClassFormat = 'individual' | 'group';

export type Modality = 'in_person' | 'online';

export type ClassLevel = 'beginner' | 'intermediate' | 'advanced';

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
  availableNow: boolean;
  averageRating: number;
  reviewCount: number;
  plan?: InstructorPlan;
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
}

export interface Institution {
  id: string;
  name: string;
  logoUrl?: string;
  description?: string;
  location?: InstitutionLocation;
  gallery?: string[];
  verified: boolean;
  plan?: InstructorPlan;
  instructors?: Pick<Instructor, 'id' | 'displayName'>[];
}

export interface ClassRecurrence {
  enabled: boolean;
  frequency: 'weekly';
  weekdays: number[];
  until: string;
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
  instructor?: Pick<Instructor, 'id' | 'displayName' | 'photoUrl'> | null;
  institution?: Pick<Institution, 'id' | 'name'> | null;
  location?: { lat: number; lng: number; label: string };
  averageRating?: number;
  classFormat?: ClassFormat;
}

export interface Class extends ClassListItem {
  description?: string;
  level?: ClassLevel;
  language?: string;
  cancellationPolicyHours?: number;
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

export interface ReportedReview extends Review {
  reportCount: number;
  reportReasons: string[];
}

export type AdminUserRole = Exclude<UserRole, 'admin'>;

export interface AdminUser {
  id: string;
  email: string;
  role: AdminUserRole;
  firstName: string;
  lastName: string;
  verified: boolean;
  suspended?: boolean;
  instructorId?: string;
  institutionId?: string;
}

export interface PendingVerification {
  type: 'instructor' | 'institution';
  id: string;
  name: string;
  submittedAt: string;
  reason: string;
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
  expiresAt: string;
  lastBookingAt: string;
  freeClassEligible: boolean;
  maxFreeClassValue: Money;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface HomeFeed {
  recommended: ClassListItem[];
  nearby: ClassListItem[];
  popular: ClassListItem[];
}

/** Default API base — override per environment */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.EXPO_PUBLIC_API_URL ??
  'https://svganchordev.net/fitnexia-api/v1';

  // 'http://localhost:3001/v1';
