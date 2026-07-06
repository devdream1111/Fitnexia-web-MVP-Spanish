'use client';

import {
  PlatformSupportPage,
  PlatformSupportPlaceholderPage,
} from '@/components/mock-v2v3/platform-support-page';
import { useFeature } from '@/hooks/use-feature';

export default function SupportPage() {
  const enabled = useFeature('platformSupport');
  return enabled ? <PlatformSupportPage /> : <PlatformSupportPlaceholderPage />;
}
