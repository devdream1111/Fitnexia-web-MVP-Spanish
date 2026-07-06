'use client';

import { OpenGamesBoard } from '@/components/mock-v2v3/open-games-panel';
import { MockFeatureGate, MockPageShell } from '@/components/mock-v2v3/mock-feature-gate';
import { MOCK_V2V3_LABELS } from '@/constants/labels';
import { useAuth } from '@/contexts/auth-context';
import { useFeature } from '@/hooks/use-feature';

export default function OpenGamesPage() {
  const enabled = useFeature('openGames');
  const { user } = useAuth();
  const name = user ? `${user.firstName} ${user.lastName}` : 'Atleta';

  return (
    <MockFeatureGate enabled={enabled} title={MOCK_V2V3_LABELS.openGamesTitle} backHref="/athlete/home">
      <MockPageShell title={MOCK_V2V3_LABELS.openGamesTitle} backHref="/athlete/home">
        <OpenGamesBoard userId={user?.id ?? 'me'} userName={name} />
      </MockPageShell>
    </MockFeatureGate>
  );
}
