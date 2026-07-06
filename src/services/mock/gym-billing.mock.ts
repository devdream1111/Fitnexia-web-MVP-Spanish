import { readMockJson, writeMockJson } from '@/services/mock/storage';

export interface MockGymBillingState {
  autoBillingEnabled: boolean;
  nextChargeAt: string | null;
  lastChargeCents: number | null;
}

function seed(): MockGymBillingState {
  return { autoBillingEnabled: false, nextChargeAt: null, lastChargeCents: null };
}

const KEY = 'gym_saas_billing';

export const mockGymBillingService = {
  get(institutionId: string): MockGymBillingState {
    return readMockJson(`${KEY}_${institutionId}`, seed);
  },

  enableAutoBilling(institutionId: string, monthlyFeeCents: number): MockGymBillingState {
    const next = new Date();
    next.setMonth(next.getMonth() + 1);
    const state: MockGymBillingState = {
      autoBillingEnabled: true,
      nextChargeAt: next.toISOString(),
      lastChargeCents: monthlyFeeCents,
    };
    writeMockJson(`${KEY}_${institutionId}`, state);
    return state;
  },
};
