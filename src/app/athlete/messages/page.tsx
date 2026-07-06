'use client';

import { ChatInbox } from '@/components/mock-v2v3/chat-panel';
import { MockFeatureGate, MockPageShell } from '@/components/mock-v2v3/mock-feature-gate';
import { MOCK_V2V3_LABELS } from '@/constants/labels';
import { useAuth } from '@/contexts/auth-context';
import { useFeature } from '@/hooks/use-feature';

export default function AthleteMessagesPage() {
  const enabled = useFeature('userInstructorChat');
  const { user } = useAuth();

  return (
    <MockFeatureGate enabled={enabled} title={MOCK_V2V3_LABELS.chatTitle} backHref="/athlete/profile">
      <MockPageShell title={MOCK_V2V3_LABELS.chatTitle} backHref="/athlete/profile">
        <ChatInbox userId={user?.id ?? 'me'} />
      </MockPageShell>
    </MockFeatureGate>
  );
}
