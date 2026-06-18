'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { DISCIPLINES as FALLBACK_DISCIPLINES } from '@/constants/fitnexia';
import { FEATURES, type FeatureKey } from '@/constants/features';
import { apiGetAppConfig, apiGetDisciplines } from '@/services/api';

type ServerFeatures = Partial<{
  googleSignIn: boolean;
  geolocationMap: boolean;
  integratedPayments: boolean;
  waitlist: boolean;
  loyaltyCredits: boolean;
  subscriptionPaymentModels: boolean;
  clubMembershipPlans: boolean;
  clubMembers: boolean;
  clubMemberInvites: boolean;
  clubRecurringBilling: boolean;
  clubMemberPortal: boolean;
  clubDelinquencyAlerts: boolean;
}>;

interface AppConfigContextValue {
  loaded: boolean;
  disciplines: string[];
  isFeatureEnabled: (key: FeatureKey) => boolean;
}

const AppConfigContext = createContext<AppConfigContextValue | null>(null);

const SERVER_FEATURE_MAP: Partial<Record<FeatureKey, keyof ServerFeatures>> = {
  googleSignIn: 'googleSignIn',
  geolocationMap: 'geolocationMap',
  integratedPayments: 'integratedPayments',
  waitlist: 'waitlist',
  loyaltyCredits: 'loyaltyCredits',
  subscriptionPaymentModels: 'subscriptionPaymentModels',
  clubMembershipPlans: 'clubMembershipPlans',
  clubMembers: 'clubMembers',
  clubMemberInvites: 'clubMemberInvites',
  clubRecurringBilling: 'clubRecurringBilling',
  clubMemberPortal: 'clubMemberPortal',
  clubDelinquencyAlerts: 'clubDelinquencyAlerts',
};

export function AppConfigProvider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [disciplines, setDisciplines] = useState<string[]>([...FALLBACK_DISCIPLINES]);
  const [serverFeatures, setServerFeatures] = useState<ServerFeatures>({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [appConfig, disciplinesRes] = await Promise.all([
          apiGetAppConfig().catch(() => null),
          apiGetDisciplines().catch(() => null),
        ]);
        if (cancelled) return;
        if (appConfig?.features) {
          setServerFeatures(appConfig.features as ServerFeatures);
        }
        if (disciplinesRes?.data?.length) {
          setDisciplines(disciplinesRes.data);
        }
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const isFeatureEnabled = useCallback(
    (key: FeatureKey) => {
      const serverKey = SERVER_FEATURE_MAP[key];
      if (serverKey && serverFeatures[serverKey] !== undefined) {
        return Boolean(serverFeatures[serverKey]);
      }
      return FEATURES[key];
    },
    [serverFeatures],
  );

  const value = useMemo(
    () => ({ loaded, disciplines, isFeatureEnabled }),
    [loaded, disciplines, isFeatureEnabled],
  );

  return <AppConfigContext.Provider value={value}>{children}</AppConfigContext.Provider>;
}

export function useAppConfig() {
  const ctx = useContext(AppConfigContext);
  if (!ctx) {
    return {
      loaded: true,
      disciplines: [...FALLBACK_DISCIPLINES],
      isFeatureEnabled: (key: FeatureKey) => FEATURES[key],
    };
  }
  return ctx;
}

export function useDisciplines(): string[] {
  return useAppConfig().disciplines;
}
