import type { CreditBalance } from '@/types/api';

import { readMockJson, updateMockJson, writeMockJson } from '@/services/mock/storage';
import { seedCreditBalance } from '@/services/mock/seed';

const STORAGE_KEY = 'credits';

export const mockCreditsService = {
  getBalance(_userId: string): CreditBalance {
    return readMockJson(STORAGE_KEY, seedCreditBalance);
  },

  applyCredits(userId: string, amount: number): CreditBalance {
    return updateMockJson(STORAGE_KEY, seedCreditBalance, (balance) => ({
      ...balance,
      balance: Math.max(0, balance.balance - amount),
      lastBookingAt: new Date().toISOString(),
      freeClassEligible: balance.balance - amount >= balance.creditsUntilReward,
    }));
  },

  resetDemo(): CreditBalance {
    const balance = seedCreditBalance();
    writeMockJson(STORAGE_KEY, balance);
    return balance;
  },
};

/** Replace with apiGetCreditBalance when backend ships. */
export function getMockCreditBalance(userId: string) {
  return mockCreditsService.getBalance(userId);
}

export function applyMockCredits(userId: string, amount: number) {
  return mockCreditsService.applyCredits(userId, amount);
}
