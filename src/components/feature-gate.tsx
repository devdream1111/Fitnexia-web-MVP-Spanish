'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { GENERAL_LABELS } from '@/constants/labels';
import type { FeatureKey } from '@/constants/features';
import { useAppConfig } from '@/contexts/app-config-context';

export function FeatureGate({
  feature,
  redirectTo = '/gym/dashboard',
  children,
}: {
  feature: FeatureKey;
  redirectTo?: string;
  children: React.ReactNode;
}) {
  const { isFeatureEnabled, loaded } = useAppConfig();
  const router = useRouter();
  const enabled = isFeatureEnabled(feature);

  useEffect(() => {
    if (loaded && !enabled) {
      router.replace(redirectTo);
    }
  }, [loaded, enabled, redirectTo, router]);

  if (!loaded) {
    return <p className="p-6 text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>;
  }

  if (!enabled) return null;

  return <>{children}</>;
}
