export type DevicePlatform = 'ios' | 'android' | 'desktop';

/** Client-only UA sniff for preferred store / banner behavior. */
export function detectDevicePlatform(
  userAgent: string = typeof navigator !== 'undefined' ? navigator.userAgent : '',
): DevicePlatform {
  const ua = userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  // iPadOS 13+ may report as Mac — treat touch Mac as iOS for store intent.
  if (typeof navigator !== 'undefined' && /macintosh/.test(ua) && navigator.maxTouchPoints > 1) {
    return 'ios';
  }
  if (/android/.test(ua)) return 'android';
  return 'desktop';
}

export function isMobileDevicePlatform(platform: DevicePlatform): boolean {
  return platform === 'ios' || platform === 'android';
}
