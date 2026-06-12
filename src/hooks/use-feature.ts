'use client';

import { useAppConfig } from '@/contexts/app-config-context';
import { FEATURES, type FeatureKey } from '@/constants/features';

/** Read a product feature flag (server config when available, else static defaults). */
export function useFeature(key: FeatureKey): boolean {
  const { isFeatureEnabled } = useAppConfig();
  return isFeatureEnabled(key);
}

export function useFeatures(): typeof FEATURES {
  return FEATURES;
}
