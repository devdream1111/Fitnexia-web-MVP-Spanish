'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  AthleteHomeDiscoverPanel,
  AthleteHomeFeatureCard,
  AthleteHomeHero,
  AthleteHomeRailCard,
  AthleteHomeSectionRail,
  AthleteHomeSectionStack,
  AthleteHomeShell,
  type AthleteHomeViewMode,
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

function mergeNearbyPopular(feed: HomeFeed | null): ClassListItem[] {
  if (!feed) return [];
  const seen = new Set<string>();
  const merged: ClassListItem[] = [];
  for (const item of [...feed.nearby, ...feed.popular]) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    merged.push(item);
  }
  return merged;
}

export default function AthleteHomePage() {
  const { homeFeed, fetchHomeFeed } = useClasses();
  const [viewMode, setViewMode] = useState<AthleteHomeViewMode>('byType');

  useEffect(() => {
    fetchHomeFeed();
  }, [fetchHomeFeed]);

  const { regularClasses, generalClasses, recommendedClasses, nearbyPopularClasses } = useMemo(() => {
    const all = mergeFeedClasses(homeFeed);
    return {
      regularClasses: all.filter((item) => isRecurringClass(item)),
      generalClasses: all.filter((item) => !isRecurringClass(item)),
      recommendedClasses: homeFeed?.recommended ?? [],
      nearbyPopularClasses: mergeNearbyPopular(homeFeed),
    };
  }, [homeFeed]);

  return (
    <AthleteHomeShell>
      <AthleteHomeHero eyebrow={GENERAL_LABELS.goodMorning} title={GENERAL_LABELS.findYourNextClass} />

      <AthleteHomeDiscoverPanel viewMode={viewMode} onViewModeChange={setViewMode}>
        {viewMode === 'byType' ? (
          <>
            <AthleteHomeSectionRail
              title={GENERAL_LABELS.regularClassesHome}
              icon="recurring"
              count={regularClasses.length}
              emptyMessage={GENERAL_LABELS.regularClassesEmpty}
            >
              {regularClasses.map((c, i) => (
                <AthleteHomeRailCard key={c.id} item={c} index={i} accent="recurring" />
              ))}
            </AthleteHomeSectionRail>

            <AthleteHomeSectionStack
              title={GENERAL_LABELS.generalClasses}
              icon="general"
              count={generalClasses.length}
              emptyMessage={GENERAL_LABELS.generalClassesEmpty}
            >
              {generalClasses.map((c, i) => (
                <AthleteHomeFeatureCard key={`g-${c.id}`} item={c} index={i} />
              ))}
            </AthleteHomeSectionStack>
          </>
        ) : (
          <>
            <AthleteHomeSectionRail
              title={GENERAL_LABELS.recommendedForYou}
              icon="recommended"
              subtitle={GENERAL_LABELS.recommendedClassesSubtitle}
              count={recommendedClasses.length}
              variant="feed"
              emptyMessage={GENERAL_LABELS.recommendedClassesEmpty}
              emptyIcon="sparkles"
            >
              {recommendedClasses.map((c, i) => (
                <AthleteHomeRailCard key={c.id} item={c} index={i} accent="recommended" />
              ))}
            </AthleteHomeSectionRail>

            <AthleteHomeSectionStack
              title={GENERAL_LABELS.nearbyPopularHome}
              icon="nearby"
              subtitle={GENERAL_LABELS.nearbyPopularSubtitle}
              count={nearbyPopularClasses.length}
              variant="feed"
              emptyMessage={GENERAL_LABELS.nearbyPopularEmpty}
              emptyIcon="map"
            >
              {nearbyPopularClasses.map((c, i) => (
                <AthleteHomeFeatureCard key={`np-${c.id}`} item={c} index={i} />
              ))}
            </AthleteHomeSectionStack>
          </>
        )}
      </AthleteHomeDiscoverPanel>
    </AthleteHomeShell>
  );
}
