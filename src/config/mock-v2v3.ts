/**
 * Virtual V2/V3 UI — swap to live APIs by setting NEXT_PUBLIC_MOCK_V2V3=false
 * once backend endpoints exist. Mock services live under @/services/mock/.
 */
export const IS_MOCK_V2V3_ENABLED =
  process.env.NEXT_PUBLIC_MOCK_V2V3 !== 'false';

/** Prefix for all mock persistence keys (see purge-local-storage.ts). */
export const MOCK_STORAGE_PREFIX = 'fitnexia_mock_v2v3_';
