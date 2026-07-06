import { readMockJson, writeMockJson } from '@/services/mock/storage';
import { DEFAULT_CURRENCY } from '@/constants/fitnexia';

export type DisplayCurrency = 'UYU' | 'USD' | 'EUR';

const STORAGE_KEY = 'display_currency';

const RATES: Record<DisplayCurrency, number> = {
  UYU: 1,
  USD: 0.025,
  EUR: 0.023,
};

export const mockCurrencyService = {
  getDisplayCurrency(): DisplayCurrency {
    return readMockJson<DisplayCurrency>(STORAGE_KEY, () => DEFAULT_CURRENCY as DisplayCurrency);
  },

  setDisplayCurrency(currency: DisplayCurrency): DisplayCurrency {
    writeMockJson(STORAGE_KEY, currency);
    return currency;
  },

  convertFromUyu(cents: number, currency: DisplayCurrency): number {
    return Math.round(cents * RATES[currency]);
  },
};

export type { DisplayCurrency as MockDisplayCurrency };
