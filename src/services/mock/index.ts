/**
 * Virtual V2/V3 services — UI-only until real APIs replace these exports.
 * When a feature is fully wired to production APIs, delete its mock service,
 * mock-only UI, seed helpers, and barrel export here. Do not leave stubs.
 *
 * Already removed (production-only): F-14 live streaming, F-29 review replies,
 * F-35 analytics, F-37 platform support, F-38 loyalty credits, F-45 collections,
 * F-47–F-53 courts booking/pricing/shifts/cancel + open games.
 */
export * from '@/services/mock/waitlist.mock';
export * from '@/services/mock/notifications.mock';
export * from '@/services/mock/payment-methods.mock';
export * from '@/services/mock/recorded-classes.mock';
export * from '@/services/mock/availability.mock';
export * from '@/services/mock/currency.mock';
export * from '@/services/mock/chat.mock';
export * from '@/services/mock/attendance.mock';
export * from '@/services/mock/staff-schedules.mock';
export * from '@/services/mock/institutions.mock';
export * from '@/services/mock/activities.mock';
export * from '@/services/mock/gym-billing.mock';
export * from '@/services/mock/instructor-pro.mock';
export * from '@/services/mock/gym-enterprise.mock';
export * from '@/services/mock/gym-reports.mock';
