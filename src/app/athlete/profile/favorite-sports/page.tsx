'use client';

import { useRouter } from 'next/navigation';

import { PageHeader } from '@/components/layout/page-header';
import { FilterChip } from '@/components/ui/filter-chip';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { DISCIPLINES } from '@/constants/fitnexia';
import { BUTTON_LABELS, SCREEN_TITLES } from '@/constants/labels';

export default function FavoriteSportsPage() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const sports = user?.favoriteSports ?? [];

  const toggle = (sport: string) => {
    const next = sports.includes(sport) ? sports.filter((s) => s !== sport) : [...sports, sport];
    updateProfile({ favoriteSports: next });
  };

  return (
    <div>
      <PageHeader title={SCREEN_TITLES.favoriteSports} showBack />
      <div className="flex flex-wrap gap-1">
        {DISCIPLINES.map((s) => (
          <FilterChip key={s} label={s} active={sports.includes(s)} onPress={() => toggle(s)} />
        ))}
      </div>
      <Button title={BUTTON_LABELS.save} className="mt-6" onClick={() => router.back()} />
    </div>
  );
}
