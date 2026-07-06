import { readMockJson } from '@/services/mock/storage';

export interface MockCollectionsSnapshot {
  monthlyRevenueCents: number;
  collectionRate: number;
  membersUpToDate: number;
  membersOverdue: number;
  membersPending: number;
  totalMembers: number;
  monthlyTrend: { month: string; revenueCents: number; rate: number }[];
}

function seed(): MockCollectionsSnapshot {
  return {
    monthlyRevenueCents: 12_450_000,
    collectionRate: 0.87,
    membersUpToDate: 142,
    membersOverdue: 8,
    membersPending: 12,
    totalMembers: 162,
    monthlyTrend: [
      { month: 'Ene', revenueCents: 10_200_000, rate: 0.82 },
      { month: 'Feb', revenueCents: 11_100_000, rate: 0.84 },
      { month: 'Mar', revenueCents: 11_800_000, rate: 0.85 },
      { month: 'Abr', revenueCents: 12_450_000, rate: 0.87 },
    ],
  };
}

const KEY = 'collections';

/** Replace with apiGetClubCollectionsSummary when backend ships. */
export const mockCollectionsService = {
  getSnapshot(): MockCollectionsSnapshot {
    return readMockJson(KEY, seed);
  },
};
