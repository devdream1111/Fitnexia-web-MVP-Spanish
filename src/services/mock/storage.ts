import { MOCK_STORAGE_PREFIX } from '@/config/mock-v2v3';

function key(suffix: string): string {
  return `${MOCK_STORAGE_PREFIX}${suffix}`;
}

export function readMockJson<T>(suffix: string, seed: () => T): T {
  if (typeof window === 'undefined') return seed();
  try {
    const raw = localStorage.getItem(key(suffix));
    if (raw) return JSON.parse(raw) as T;
  } catch {
    // fall through to seed
  }
  const initial = seed();
  writeMockJson(suffix, initial);
  return initial;
}

export function writeMockJson<T>(suffix: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key(suffix), JSON.stringify(value));
}

export function updateMockJson<T>(suffix: string, seed: () => T, updater: (prev: T) => T): T {
  const prev = readMockJson(suffix, seed);
  const next = updater(prev);
  writeMockJson(suffix, next);
  return next;
}
