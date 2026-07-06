/** Bump when a full client storage reset should run once for all users. */
const PURGE_VERSION = '2026-07-02-revert-partial-features';
const PURGE_MARKER_KEY = 'fitnexia_storage_purge_version';

/** Known Fitnexia keys (including orphaned keys from removed frontend-only features). */
export const FITNEXIA_LOCAL_STORAGE_KEYS = [
  'fitnexia_access_token',
  'fitnexia_refresh_token',
  'fitnexia_user',
  'fitnexia_has_seen_onboarding',
  'fitnexia-theme-mode',
  'fitnexia_class_recurrence_registry',
  'fitnexia_read_invite_ids',
  'fitnexia_class_stream_registry',
  'fitnexia_class_waitlist',
  'fitnexia_in_app_notifications',
  'fitnexia_review_responses',
  PURGE_MARKER_KEY,
] as const;

/**
 * Wipes all localStorage data once per purge version.
 * Runs on the client before other providers read persisted state.
 */
export function purgeLocalStorageOnce(): void {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(PURGE_MARKER_KEY) === PURGE_VERSION) return;

  localStorage.clear();
  localStorage.setItem(PURGE_MARKER_KEY, PURGE_VERSION);
}
