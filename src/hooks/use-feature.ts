'use client';

import { IS_MOCK_V2V3_ENABLED } from '@/config/mock-v2v3';
import { isMockV2V3FeatureKey } from '@/constants/mock-features';
import { useAppConfig } from '@/contexts/app-config-context';
import { FEATURES, type FeatureKey } from '@/constants/features';

/** Read a product feature flag (server config when available, else static defaults). */
export function useFeature(key: FeatureKey): boolean {
  const { isFeatureEnabled } = useAppConfig();
  if (isFeatureEnabled(key)) return true;
  if (IS_MOCK_V2V3_ENABLED && isMockV2V3FeatureKey(key)) return true;
  return false;
}

export function useFeatures(): typeof FEATURES {
  return FEATURES;
}
