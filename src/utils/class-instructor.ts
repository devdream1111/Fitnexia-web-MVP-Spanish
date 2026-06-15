import type { ClassListItem } from '@/types/api';

export function hasAssignedInstructor(
  cls: Pick<ClassListItem, 'instructor'>,
): boolean {
  return Boolean(cls.instructor?.id);
}

export function classHostLabel(
  cls: Pick<ClassListItem, 'instructor' | 'institution'>,
  fallback = 'Gimnasio',
): string {
  if (hasAssignedInstructor(cls)) {
    return cls.instructor!.displayName;
  }
  return cls.institution?.name ?? fallback;
}
