'use client';

import {
  PlatformSupportPage,
  PlatformSupportPlaceholderPage,
} from '@/components/mock-v2v3/platform-support-page';
import { useFeature } from '@/hooks/use-feature';

export default function GymSupportPage() {
  const enabled = useFeature('platformSupport');
  const priority = useFeature('prioritySupport');
  const dedicated = useFeature('dedicatedSupport');
  const tier = dedicated ? 'dedicated' : priority ? 'priority' : 'standard';
  return enabled ? <PlatformSupportPage tier={tier} /> : <PlatformSupportPlaceholderPage />;
}
