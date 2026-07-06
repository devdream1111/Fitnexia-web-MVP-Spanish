import { readMockJson } from '@/services/mock/storage';

export interface MockInstitutionSearchResult {
  id: string;
  name: string;
  city: string;
  address: string;
  verified: boolean;
  memberCount: number;
  disciplines: string[];
  logoUrl?: string;
}

function seed(): MockInstitutionSearchResult[] {
  return [
    {
      id: 'mock-club-1',
      name: 'Club Costa Deportivo',
      city: 'Punta del Este',
      address: 'Av. Gorlero 1200',
      verified: true,
      memberCount: 340,
      disciplines: ['Pádel', 'Tenis', 'Fitness'],
    },
    {
      id: 'mock-club-2',
      name: 'Gimnasio Central',
      city: 'Montevideo',
      address: 'Bv. Artigas 450',
      verified: true,
      memberCount: 520,
      disciplines: ['CrossFit', 'Yoga', 'Spinning'],
    },
    {
      id: 'mock-club-3',
      name: 'Escuela Deportiva del Sur',
      city: 'Maldonado',
      address: 'Ruta 39 km 4',
      verified: false,
      memberCount: 180,
      disciplines: ['Fútbol', 'Rugby'],
    },
  ];
}

const KEY = 'institutions_search';

export const mockInstitutionsService = {
  search(query: string): MockInstitutionSearchResult[] {
    const all = readMockJson(KEY, seed);
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.disciplines.some((d) => d.toLowerCase().includes(q)),
    );
  },
};
