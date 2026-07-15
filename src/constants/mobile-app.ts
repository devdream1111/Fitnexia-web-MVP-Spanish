import type { DevicePlatform } from '@/utils/device-platform';
import { toGoogleDriveDirectDownloadUrl } from '@/utils/google-drive-download';

/**
 * Native app distribution URLs.
 * - iOS / Play: store listings
 * - Android APK: Drive (or CDN) file — used when Play Store URL is empty
 * Empty values keep CTAs as “Próximamente”.
 */
export const MOBILE_APP_STORES = {
  ios: (process.env.NEXT_PUBLIC_IOS_APP_STORE_URL ?? '').trim(),
  android: (process.env.NEXT_PUBLIC_ANDROID_PLAY_STORE_URL ?? '').trim(),
} as const;

/** Share or direct-download URL for the Android APK (Google Drive, CDN, etc.). */
export const ANDROID_APK_URL = (process.env.NEXT_PUBLIC_ANDROID_APK_URL ?? '').trim();

/** Same-origin path that triggers the APK download without leaving the SPA as a document. */
export const ANDROID_APK_DOWNLOAD_PATH = '/api/downloads/android-apk';

export const ANDROID_APK_FILENAME = 'fitnexia.apk';

export type AppStorePlatform = keyof typeof MOBILE_APP_STORES;

export type AndroidDistribution = 'play' | 'apk';

export const SMART_APP_BANNER_DISMISS_KEY = 'fitnexia_smart_app_banner_dismissed_v1';

export function getAndroidDistribution(): AndroidDistribution | null {
  if (MOBILE_APP_STORES.android.length > 0) return 'play';
  if (ANDROID_APK_URL.length > 0) return 'apk';
  return null;
}

export function hasMobileAppStoreUrl(platform: AppStorePlatform): boolean {
  if (platform === 'android') return getAndroidDistribution() !== null;
  return MOBILE_APP_STORES.ios.length > 0;
}

export function getAndroidApkDirectUrl(): string {
  return toGoogleDriveDirectDownloadUrl(ANDROID_APK_URL);
}

export function preferredStorePlatform(device: DevicePlatform): AppStorePlatform {
  return device === 'android' ? 'android' : 'ios';
}

/** Trigger APK download without navigating the current page away. */
export function triggerAndroidApkDownload(): void {
  if (typeof document === 'undefined') return;
  if (!ANDROID_APK_URL) return;

  const anchor = document.createElement('a');
  anchor.href = `${ANDROID_APK_DOWNLOAD_PATH}?t=${Date.now()}`;
  anchor.setAttribute('download', ANDROID_APK_FILENAME);
  anchor.rel = 'noopener';
  // Same-origin proxy returns Content-Disposition: attachment — stay in-document.
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export function openStoreOrFallback(
  platform: AppStorePlatform,
  onUnavailable?: () => void,
): void {
  if (platform === 'android') {
    const mode = getAndroidDistribution();
    if (mode === 'play') {
      window.open(MOBILE_APP_STORES.android, '_blank', 'noopener,noreferrer');
      return;
    }
    if (mode === 'apk') {
      triggerAndroidApkDownload();
      return;
    }
    onUnavailable?.();
    return;
  }

  const url = MOBILE_APP_STORES.ios;
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  onUnavailable?.();
}
