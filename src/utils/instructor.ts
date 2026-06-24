import type { AuthUser } from '@/contexts/auth-context';

/** Instructor profile id from the authenticated user session */
export function getLinkedInstructorId(user: AuthUser | null | undefined): string {
  return user?.instructorId ?? '';
}
