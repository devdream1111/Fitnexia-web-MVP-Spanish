'use client';

import { User, Dumbbell, Building2 } from 'lucide-react';
import { ROLE_DESCRIPTIONS } from '@/constants/labels';
import type { UserRole } from '@/types/api';

const ROLE_META: Record<
  Exclude<UserRole, 'admin'>,
  { title: string; icon: React.ReactNode }
> = {
  athlete: { title: 'Athlete', icon: <User size={36} /> },
  instructor: { title: 'Instructor', icon: <Dumbbell size={36} /> },
  institution: { title: 'Gym / School', icon: <Building2 size={36} /> },
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
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]">
        {meta.icon}
      </div>
      <div>
        <p className="font-bold">{meta.title}</p>
        <p className="text-sm text-[var(--fn-text-muted)]">{ROLE_DESCRIPTIONS[role]}</p>
      </div>
    </button>
  );
}
