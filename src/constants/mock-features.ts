import type { FeatureKey } from '@/constants/features';

/** Post-MVP flags implemented with virtual data until backend APIs ship. */
export const MOCK_V2V3_FEATURE_KEYS = [
  'recordedClasses',
  'multipleCurrencies',
  'digitalWallets',
  'savedPaymentMethods',
  'qrAccessControl',
  'userInstructorChat',
  'gymSaasBilling',
  'institutionSearch',
  'gymReportsBasic',
  'staffSchedules',
  'prioritySupport',
  'attendanceTracking',
  'clubBranding',
  'gymReportsAdvanced',
  'activityManagement',
  'enterpriseOnboarding',
  'enterpriseIntegrations',
  'dedicatedSupport',
  'instructorProBilling',
] as const satisfies readonly FeatureKey[];

export type MockV2V3FeatureKey = (typeof MOCK_V2V3_FEATURE_KEYS)[number];

export function isMockV2V3FeatureKey(key: FeatureKey): key is MockV2V3FeatureKey {
  return (MOCK_V2V3_FEATURE_KEYS as readonly FeatureKey[]).includes(key);
}
