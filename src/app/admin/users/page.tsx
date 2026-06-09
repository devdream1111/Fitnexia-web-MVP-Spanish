'use client';

import { useMemo, useState } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { TAB_LABELS, ADMIN_LABELS, ROLE_TITLES, GENERAL_LABELS } from '@/constants/labels';
import { useAdmin } from '@/contexts/admin-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { AdminUserRole } from '@/types/api';

export default function AdminUsersPage() {
  const { users, toggleUserVerified, toggleUserSuspended } = useAdmin();
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = filter === 'all' || user.role === filter;
      const matchesSearch =
        !query ||
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);
      return matchesRole && matchesSearch;
    });
  }, [users, filter, search]);

  return (
    <div className="space-y-6">
      <PageHeader title={TAB_LABELS.admin.users} showBack />

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex-1 max-w-xl">
          <Input
            label={GENERAL_LABELS.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nombre o correo..."
          />
        </div>
        <div className="w-full md:w-48">
          <Select
            label={ADMIN_LABELS.users.filterByRole}
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: ADMIN_LABELS.users.allRoles },
              { value: 'athlete', label: ROLE_TITLES.athlete },
              { value: 'instructor', label: ROLE_TITLES.instructor },
              { value: 'institution', label: ROLE_TITLES.institution },
            ]}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-[var(--fn-surface)]">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="flex flex-col gap-4 border-b border-[var(--fn-border)] p-4 last:border-b-0 hover:bg-[var(--fn-surface-muted)] md:flex-row md:items-center md:justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--fn-primary-muted)]">
                <span className="text-lg font-semibold text-[var(--fn-primary)]">
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-semibold text-[var(--fn-text)]">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-[var(--fn-text-muted)]">{user.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <Badge label={ROLE_TITLES[user.role as AdminUserRole]} variant="default" />
              {(user.role === 'instructor' || user.role === 'institution') && (
                <Badge
                  label={user.verified ? ADMIN_LABELS.verification.verified : ADMIN_LABELS.verification.pending}
                  variant={user.verified ? 'success' : 'warning'}
                />
              )}
              {user.suspended && <Badge label="Suspendido" variant="danger" />}
              {(user.role === 'instructor' || user.role === 'institution') && (
                <Button variant="outline" size="sm" onClick={() => toggleUserVerified(user.id)}>
                  {user.verified ? 'Desverificar' : ADMIN_LABELS.users.verify}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => toggleUserSuspended(user.id)}>
                {user.suspended ? 'Reactivar' : ADMIN_LABELS.users.suspend}
              </Button>
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-[var(--fn-text-muted)]">
            No hay usuarios con este filtro
          </div>
        )}
      </div>
    </div>
  );
}
