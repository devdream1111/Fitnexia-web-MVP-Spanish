'use client';

import { OpenGamesBoard } from '@/components/open-games/open-games-board';
import { PageHeader } from '@/components/layout/page-header';
import { MOCK_V2V3_LABELS } from '@/constants/labels';

export default function OpenGamesPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-4">
      <PageHeader
        title={MOCK_V2V3_LABELS.openGamesTitle}
        showBack
        backHref="/athlete/home"
      />
      <OpenGamesBoard />
    </div>
  );
}
