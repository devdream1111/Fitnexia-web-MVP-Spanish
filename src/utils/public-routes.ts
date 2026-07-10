const INSTRUCTOR_APP_SEGMENTS = new Set([
  'dashboard',
  'classes',
  'calendar',
  'jobs',
  'earnings',
  'notifications',
  'analytics',
  'create-class',
  'profile',
]);

/** Public athlete-facing instructor profile: `/instructor/:id`. */
export function isPublicInstructorProfileRoute(pathname: string): boolean {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length !== 2 || parts[0] !== 'instructor') return false;
  const segment = parts[1];
  if (INSTRUCTOR_APP_SEGMENTS.has(segment)) return false;
  if (segment.startsWith('edit-class')) return false;
  return true;
}

/** Gym staff instructor profile: `/gym/instructors/:id`. */
export function isGymInstructorProfileRoute(pathname: string): boolean {
  return /^\/gym\/instructors\/[^/]+$/.test(pathname);
}

/** Public club profile: `/club/:id`. */
export function isPublicClubProfileRoute(pathname: string): boolean {
  return /^\/club\/[^/]+$/.test(pathname);
}

/** Routes that render without RoleShell header/footer and site footer. */
export function isChromelessProfileRoute(pathname: string): boolean {
  return (
    isPublicInstructorProfileRoute(pathname) ||
    isGymInstructorProfileRoute(pathname) ||
    isPublicClubProfileRoute(pathname)
  );
}
