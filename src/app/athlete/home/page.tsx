'use client';

import { useEffect, useMemo } from 'react';

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
import { isRecurringClass } from '@/utils/class-series';
import type { ClassListItem, HomeFeed } from '@/types/api';

function mergeFeedClasses(feed: HomeFeed | null): ClassListItem[] {
  if (!feed) return [];
  const seen = new Set<string>();
  const merged: ClassListItem[] = [];
  for (const item of [...feed.nearby, ...feed.recommended, ...feed.popular]) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    merged.push(item);
  }
  return merged;
}

export default function AthleteHomePage() {
  const { homeFeed, fetchHomeFeed } = useClasses();

  useEffect(() => {
    fetchHomeFeed();
  }, [fetchHomeFeed]);

  const { regularClasses, generalClasses } = useMemo(() => {
    const all = mergeFeedClasses(homeFeed);
    return {
      regularClasses: all.filter((item) => isRecurringClass(item)),
      generalClasses: all.filter((item) => !isRecurringClass(item)),
    };
  }, [homeFeed]);

  return (
    <AthleteHomeShell>
      <AthleteHomeHero eyebrow={GENERAL_LABELS.goodMorning} title={GENERAL_LABELS.findYourNextClass} />

      <AthleteHomeSectionRail title={GENERAL_LABELS.regularClassesHome} icon="recurring">
        {regularClasses.map((c, i) => (
          <AthleteHomeRailCard key={c.id} item={c} index={i} />
        ))}
      </AthleteHomeSectionRail>

      <AthleteHomeSectionStack title={GENERAL_LABELS.generalClasses} icon="general">
        {generalClasses.map((c, i) => (
          <AthleteHomeFeatureCard key={`g-${c.id}`} item={c} index={i} />
        ))}
      </AthleteHomeSectionStack>
    </AthleteHomeShell>
  );
}
