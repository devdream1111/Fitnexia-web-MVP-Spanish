/**
 * Virtual V2/V3 services — UI-only until real APIs replace these exports.
 * Search for "Replace with api" in ./mock/*.mock.ts when wiring backend.
 */
export * from '@/services/mock/waitlist.mock';
export * from '@/services/mock/credits.mock';
export * from '@/services/mock/notifications.mock';
export * from '@/services/mock/payment-methods.mock';
export * from '@/services/mock/support.mock';
export * from '@/services/mock/review-responses.mock';
export * from '@/services/mock/recorded-classes.mock';
export * from '@/services/mock/streaming.mock';
export * from '@/services/mock/analytics.mock';
export * from '@/services/mock/availability.mock';
export * from '@/services/mock/currency.mock';
export * from '@/services/mock/courts.mock';
export * from '@/services/mock/collections.mock';
export * from '@/services/mock/chat.mock';
export * from '@/services/mock/open-games.mock';
export * from '@/services/mock/attendance.mock';
export * from '@/services/mock/staff-schedules.mock';
export * from '@/services/mock/institutions.mock';
export * from '@/services/mock/activities.mock';
export * from '@/services/mock/gym-billing.mock';
export * from '@/services/mock/instructor-pro.mock';
export * from '@/services/mock/gym-enterprise.mock';
export * from '@/services/mock/gym-reports.mock';
export { enrichReviewsWithMockResponses } from '@/services/mock/seed';
