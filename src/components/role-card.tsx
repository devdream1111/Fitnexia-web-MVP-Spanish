'use client';

import { ROLE_DESCRIPTIONS } from '@/constants/labels';
import type { UserRole } from '@/types/api';

const ROLE_META: Record<Exclude<UserRole, 'admin'>, { title: string; emoji: string }> = {
  athlete: { title: 'Athlete', emoji: '🏃' },
  instructor: { title: 'Instructor', emoji: '🎾' },
  institution: { title: 'Gym / School', emoji: '🏢' },
};

export function RoleCard({
  role,
  selected,
  onPress,
}: {
  role: Exclude<UserRole, 'admin'>;
  selected: boolean;
  onPress: () => void;
}) {
  const meta = ROLE_META[role];
  return (
    <button
      type="button"
      onClick={onPress}
      className={`mb-3 flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition ${
        selected
          ? 'border-[var(--fn-primary)] bg-[var(--fn-primary-muted)]'
          : 'border-[var(--fn-border)] bg-[var(--fn-surface)]'
      }`}>
      <span className="text-3xl">{meta.emoji}</span>
      <div>
        <p className="font-bold">{meta.title}</p>
        <p className="text-sm text-[var(--fn-text-muted)]">{ROLE_DESCRIPTIONS[role]}</p>
      </div>
    </button>
  );
}
