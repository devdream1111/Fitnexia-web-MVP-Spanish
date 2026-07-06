import { readMockJson, updateMockJson, writeMockJson } from '@/services/mock/storage';
import { seedPaymentMethods, type MockPaymentMethod } from '@/services/mock/seed';

const STORAGE_KEY = 'payment_methods';

export const mockPaymentMethodsService = {
  list(): MockPaymentMethod[] {
    return readMockJson(STORAGE_KEY, seedPaymentMethods);
  },

  add(input: Omit<MockPaymentMethod, 'id'>): MockPaymentMethod[] {
    return updateMockJson(STORAGE_KEY, seedPaymentMethods, (methods) => {
      const id = `mock-pm-${Date.now()}`;
      const next = [...methods, { ...input, id }];
      if (input.isDefault) {
        return next.map((m) => ({ ...m, isDefault: m.id === id }));
      }
      return next;
    });
  },

  remove(id: string): MockPaymentMethod[] {
    return updateMockJson(STORAGE_KEY, seedPaymentMethods, (methods) => {
      const removed = methods.find((m) => m.id === id);
      const next = methods.filter((m) => m.id !== id);
      if (removed?.isDefault && next.length > 0) {
        next[0] = { ...next[0], isDefault: true };
      }
      return next;
    });
  },

  setDefault(id: string): MockPaymentMethod[] {
    return updateMockJson(STORAGE_KEY, seedPaymentMethods, (methods) =>
      methods.map((m) => ({ ...m, isDefault: m.id === id })),
    );
  },
};

export type { MockPaymentMethod };
