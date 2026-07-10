/** Mirrors backend join-window constants in live-streaming.service.js */
export const LIVE_STREAM_JOIN_BEFORE_MS = 15 * 60 * 1000;
export const LIVE_STREAM_JOIN_AFTER_MS = 30 * 60 * 1000;

export function liveStreamClassHref(classId: string): string {
  return `/class/${classId}?live=1`;
}

export function isWithinLiveStreamJoinWindow(
  startAt: string,
  durationMinutes = 60,
): boolean {
  const start = new Date(startAt).getTime();
  if (Number.isNaN(start)) return false;
  const end = start + durationMinutes * 60 * 1000 + LIVE_STREAM_JOIN_AFTER_MS;
  const now = Date.now();
  return now >= start - LIVE_STREAM_JOIN_BEFORE_MS && now <= end;
}

export function isOnlineClass(modality: string | undefined): boolean {
  return modality === 'online';
}

export function parseLiveClassIdFromPath(path: string): string | null {
  const match = path.match(/^\/live\/([^/?#]+)/);
  return match?.[1] ?? null;
}
