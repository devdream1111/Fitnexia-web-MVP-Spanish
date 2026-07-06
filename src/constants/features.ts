/**
 * Product feature flags for Fitnexia mobile.
 * MVP ships with post-MVP flags disabled; flip individually when backend is ready.
 * Prefer server-driven flags via GET /config/features in production.
 */
export const FEATURES = {
  // --- MVP (enabled) ---
  emailAuth: true,
  roleOnboarding: true,
  basicSearch: true,
  classBooking: true,
  bookingHistory: true,
  verifiedReviews: true,
  instructorClassPublish: true,
  instructorAvailability: true,
  instructorAvailableNow: true,
  gymStaffManagement: true,
  gymStaffReviews: true,
  gymBasicDashboard: true,
  profileEditing: true,
  passwordRecovery: true,
  notificationPreferences: true,
  googleSignIn: true,
  profileVerification: true,
  accountDeletion: true,

  // --- Post-MVP (disabled for v1) ---
  advancedSearch: true,
  recurringClasses: true,
  liveStreaming: false,
  recordedClasses: false,
  waitlist: true,
  multipleCurrencies: false,
  digitalWallets: false,
  subscriptionPaymentModels: true,
  integratedPayments: true,
  loyaltyCredits: false,
  reviewResponses: true,
  inAppNotificationCenter: true,
  analyticsMetrics: false,
  platformSupport: false,
  savedPaymentMethods: false,
  geolocationMap: true,

  // Courts & clubs V2/V3 (UI mock until backend)
  courtManagement: false,
  courtBooking: false,
  courtRecurringShifts: false,
  qrAccessControl: false,
  openGames: false,
  clubCollectionsPanel: false,
  userInstructorChat: false,

  // Gym / instructor plan V1/V2 (UI mock until backend)
  gymSaasBilling: false,
  institutionSearch: false,
  gymReportsBasic: false,
  staffSchedules: false,
  prioritySupport: false,
  attendanceTracking: false,
  clubBranding: false,
  gymReportsAdvanced: false,
  activityManagement: false,
  enterpriseOnboarding: false,
  enterpriseIntegrations: false,
  dedicatedSupport: false,
  instructorProBilling: false,

  // F-39–F-44 — club membership & collections (MVP)
  clubMembershipPlans: true,
  clubMembers: true,
  clubMemberInvites: true,
  clubRecurringBilling: true,
  clubMemberPortal: true,
  clubDelinquencyAlerts: true,
} as const;

export type FeatureKey = keyof typeof FEATURES;

export function isFeatureEnabled(key: FeatureKey): boolean {
  return FEATURES[key];
}

/** Notification preference keys hidden when related features are off. */
export function isNotificationPrefVisible(key: string): boolean {
  if (key === 'creditsExpiring' && !FEATURES.loyaltyCredits) return false;
  if (key === 'paymentUpdates' && !FEATURES.integratedPayments) return false;
  if (key === 'membershipReminders' && !FEATURES.clubDelinquencyAlerts) return false;
  if (key === 'memberDelinquencyAlerts' && !FEATURES.clubDelinquencyAlerts) return false;
  return true;
}
