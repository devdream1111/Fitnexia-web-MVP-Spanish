import { readMockJson, updateMockJson } from '@/services/mock/storage';

export type OpenGameSport = 'padel' | 'football_5';

export interface MockOpenGame {
  id: string;
  sport: OpenGameSport;
  title: string;
  location: string;
  date: string;
  startTime: string;
  slotsTotal: number;
  slotsFilled: number;
  hostName: string;
  hostUserId: string;
  joinedUserIds: string[];
}

function seed(): MockOpenGame[] {
  return [
    {
      id: 'mock-og-1',
      sport: 'padel',
      title: 'Pádel mixto — nivel intermedio',
      location: 'Club Costa, Cancha 2',
      date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
      startTime: '19:00',
      slotsTotal: 4,
      slotsFilled: 2,
      hostName: 'Diego M.',
      hostUserId: 'host-1',
      joinedUserIds: ['host-1', 'user-2'],
    },
    {
      id: 'mock-og-2',
      sport: 'football_5',
      title: 'Fútbol 5 — falta 1',
      location: 'Gimnasio Central',
      date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      startTime: '21:00',
      slotsTotal: 10,
      slotsFilled: 9,
      hostName: 'Laura S.',
      hostUserId: 'host-2',
      joinedUserIds: Array.from({ length: 9 }, (_, i) => `user-${i}`),
    },
  ];
}

const KEY = 'open_games';

export const mockOpenGamesService = {
  list(): MockOpenGame[] {
    return readMockJson(KEY, seed);
  },

  join(gameId: string, userId: string): MockOpenGame | null {
    let result: MockOpenGame | null = null;
    updateMockJson(KEY, seed, (games) =>
      games.map((g) => {
        if (g.id !== gameId || g.slotsFilled >= g.slotsTotal || g.joinedUserIds.includes(userId)) {
          return g;
        }
        const next = {
          ...g,
          slotsFilled: g.slotsFilled + 1,
          joinedUserIds: [...g.joinedUserIds, userId],
        };
        result = next;
        return next;
      }),
    );
    return result;
  },

  create(
    hostUserId: string,
    hostName: string,
    data: Omit<MockOpenGame, 'id' | 'hostUserId' | 'hostName' | 'joinedUserIds' | 'slotsFilled'>,
  ): MockOpenGame {
    const game: MockOpenGame = {
      ...data,
      id: `mock-og-${Date.now()}`,
      hostUserId,
      hostName,
      slotsFilled: 1,
      joinedUserIds: [hostUserId],
    };
    updateMockJson(KEY, seed, (prev) => [...prev, game]);
    return game;
  },
};
