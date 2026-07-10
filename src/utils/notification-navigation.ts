import type { Notification, UserRole } from '@/types/api';
import { liveStreamClassHref, parseLiveClassIdFromPath } from '@/utils/live-stream';

function readString(data: Record<string, unknown> | undefined, key: string): string | null {
  const value = data?.[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

/** Exact Expo / mobile deep links emitted by the backend that are not 1:1 with Next routes. */
const EXACT_SCREEN_MAP: Record<string, string> = {
  '/(athlete)/courts/reservations': '/athlete/court-bookings',
  '/(athlete)/courts/recurring-shifts': '/athlete/court-bookings',
};

const WEB_PATH_PREFIXES = [
  '/athlete/',
  '/instructor/',
  '/gym/',
  '/auth/',
  '/class/',
  '/book/',
  '/review/',
  '/club/',
  '/join-club/',
  '/live/',
  '/legal/',
  '/onboarding',
] as const;

function stripExpoRouteGroups(path: string): string {
  return path
    .split('/')
    .filter((segment) => segment.length > 0 && !/^\([^)]+\)$/.test(segment))
    .join('/');
}

function withLeadingSlash(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

function isKnownWebPath(path: string): boolean {
  if (path === '/onboarding') return true;
  return WEB_PATH_PREFIXES.some((prefix) => path === prefix.slice(0, -1) || path.startsWith(prefix));
}

function mapProfileVerify(role?: UserRole | null): string {
  if (role === 'instructor') return '/instructor/profile/verification';
  if (role === 'institution') return '/gym/profile/verification';
  return '/athlete/profile';
}

function mapCreateClass(role?: UserRole | null): string {
  if (role === 'institution') return '/gym/create-class';
  return '/instructor/create-class';
}

/**
 * Maps backend notification `data.screen` (Expo Router deep links) to Next.js App Router hrefs.
 */
export function mapNotificationScreen(
  screen: string,
  data?: Record<string, unknown>,
  role?: UserRole | null,
): string | null {
  const raw = withLeadingSlash(screen.trim());
  if (!raw || raw === '/') return null;

  const liveClassId = parseLiveClassIdFromPath(raw);
  if (liveClassId) return liveStreamClassHref(liveClassId);

  if (raw === '/profile/verify') return mapProfileVerify(role);
  if (raw === '/create-class') return mapCreateClass(role);

  if (raw === '/membership/join') {
    const inviteCode = readString(data, 'inviteCode');
    return inviteCode
      ? `/join-club/${encodeURIComponent(inviteCode)}`
      : '/athlete/club-membership';
  }

  const membershipMatch = raw.match(/^\/membership\/([^/?#]+)$/);
  if (membershipMatch && membershipMatch[1] !== 'join') {
    return `/athlete/club-membership/${encodeURIComponent(membershipMatch[1])}`;
  }

  const openGameMatch = raw.match(/^\/open-games(?:\/([^/?#]+))?$/);
  if (openGameMatch) return '/athlete/open-games';

  const exact = EXACT_SCREEN_MAP[raw];
  if (exact) return exact;

  // Already a web path (e.g. `/class/:id`, `/review/:id`)
  if (!raw.includes('(') && isKnownWebPath(raw)) return raw;

  // `/(athlete)/(tabs)/bookings` → `/athlete/bookings`
  const stripped = withLeadingSlash(stripExpoRouteGroups(raw));
  if (stripped && stripped !== '/' && isKnownWebPath(stripped)) return stripped;

  return null;
}

function hrefFromNotificationData(
  notification: Notification,
  role?: UserRole | null,
): string | null {
  const data = notification.data;
  const classId = readString(data, 'classId');
  const bookingId = readString(data, 'bookingId');
  const memberId = readString(data, 'memberId');
  const inviteCode = readString(data, 'inviteCode');

  switch (notification.type) {
    case 'live_class_started':
      return classId ? liveStreamClassHref(classId) : null;
    case 'review_invite':
      return bookingId ? `/review/${encodeURIComponent(bookingId)}` : null;
    case 'waitlist_spot':
    case 'class_posted':
    case 'class_updated_by_instructor':
      return classId ? `/class/${encodeURIComponent(classId)}` : '/athlete/bookings';
    case 'court_reservation_confirmed':
    case 'recurring_shift_created':
    case 'recurring_shift_reservation':
    case 'recurring_shift_skipped':
      return '/athlete/court-bookings';
    case 'open_game_player_joined':
    case 'open_game_cancelled':
      return '/athlete/open-games';
    case 'membership_invite':
      return inviteCode
        ? `/join-club/${encodeURIComponent(inviteCode)}`
        : '/athlete/club-membership';
    case 'membership_due_reminder':
    case 'membership_payment_confirmed':
    case 'membership_payment_failed':
    case 'membership_overdue':
      return memberId
        ? `/athlete/club-membership/${encodeURIComponent(memberId)}`
        : '/athlete/club-membership';
    case 'club_arrears_alert':
      return '/gym/members';
    case 'verification_approved':
    case 'verification_rejected':
      return mapProfileVerify(role);
    case 'instructor_invite':
      return role === 'instructor' ? '/instructor/dashboard' : '/gym/instructors';
    case 'booking_confirmed':
    case 'payment_confirmed':
    case 'class_reminder_24h':
    case 'class_reminder_1h':
    case 'class_reminder_10m':
    case 'class_cancelled_by_instructor':
    case 'class_ended':
    case 'series_paused':
    case 'series_deleted':
    case 'class_scheduled':
      return classId ? `/class/${encodeURIComponent(classId)}` : '/athlete/bookings';
    case 'credits_expiring':
      return '/athlete/profile';
    case 'password_reset':
      return '/auth/forgot-password';
    default:
      return null;
  }
}

export function getNotificationHref(
  notification: Notification,
  role?: UserRole | null,
): string | null {
  const data = notification.data;

  if (notification.type === 'live_class_started') {
    const classId = readString(data, 'classId');
    if (classId) return liveStreamClassHref(classId);
  }

  const screen = readString(data, 'screen');
  if (screen) {
    const mapped = mapNotificationScreen(screen, data, role);
    if (mapped) return mapped;
  }

  return hrefFromNotificationData(notification, role);
}
