import type { ClassListItem } from '@/types/api';

import type { MockStreamSession } from '@/services/mock/seed';

/** Replace with apiGetClassStreamSession when backend ships. */
export function getMockStreamSession(cls: ClassListItem): MockStreamSession | null {
  if (cls.modality !== 'online') return null;
  const slug = cls.title.toLowerCase().replace(/\s+/g, '-').slice(0, 24);
  return {
    classId: cls.id,
    joinUrl: `https://meet.fitnexia.demo/${slug}-${cls.id.slice(0, 8)}`,
    meetingId: `${cls.id.slice(0, 4)}-${cls.id.slice(4, 8)}`.toUpperCase(),
    passcode: 'FIT2026',
  };
}

export type { MockStreamSession };
