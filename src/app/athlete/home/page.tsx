'use client';

import { useEffect } from 'react';

import {
  AthleteHomeFeatureCard,
  AthleteHomeHero,
  AthleteHomeRailCard,
  AthleteHomeSectionRail,
  AthleteHomeSectionStack,
  AthleteHomeShell,
} from '@/components/dashboard/athlete-home-ui';
import { useClasses } from '@/contexts/classes-context';
import { GENERAL_LABELS } from '@/constants/labels';

export default function AthleteHomePage() {
  const { homeFeed, fetchHomeFeed, loading } = useClasses();

  useEffect(() => {
    fetchHomeFeed();
  }, [fetchHomeFeed]);

  const nearby = homeFeed?.nearby ?? [];
  const recommended = homeFeed?.recommended ?? [];

  if (loading && !homeFeed) {
    return (
      <AthleteHomeShell>
        <p className="text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
      </AthleteHomeShell>
    );
  }

  return (
    <AthleteHomeShell>
      <AthleteHomeHero eyebrow={GENERAL_LABELS.goodMorning} title={GENERAL_LABELS.findYourNextClass} />

      <AthleteHomeSectionRail title={GENERAL_LABELS.nearby} icon="nearby">
        {nearby.map((c, i) => (
          <AthleteHomeRailCard key={c.id} item={c} index={i} />
        ))}
      </AthleteHomeSectionRail>

      <AthleteHomeSectionStack title={GENERAL_LABELS.recommendedForYou}>
        {recommended.map((c, i) => (
          <AthleteHomeFeatureCard key={`r-${c.id}`} item={c} index={i} flip={i % 2 === 1} />
        ))}
      </AthleteHomeSectionStack>
    </AthleteHomeShell>
  );
}
