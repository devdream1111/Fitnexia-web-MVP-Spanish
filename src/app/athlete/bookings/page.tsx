'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useClasses } from '@/contexts/classes-context';
import { formatClassDate, formatMoney, MOCK_BOOKINGS } from '@/data/mock';
import type { Booking, ClassListItem } from '@/types/api';

export default function BookingsPage() {
  const { getClassById } = useClasses();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const list = tab === 'upcoming'
    ? MOCK_BOOKINGS.filter((b) => b.status === 'confirmed')
    : MOCK_BOOKINGS.filter((b) => b.status === 'completed');

  const entries = useMemo(() => {
    return list
      .map((booking) => {
        const cls = getClassById(booking.classId);
        if (!cls) return null;
        return { booking, cls };
      })
      .filter((e): e is { booking: Booking; cls: ClassListItem } => e !== null);
  }, [list, getClassById]);

  return (
    <div>
      <h1 className="mb-4 text-3xl font-extrabold">My bookings</h1>
      <div className="mb-6 flex rounded-xl bg-[var(--fn-surface-muted)] p-1">
        {(['upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
              tab === t ? 'bg-[var(--fn-surface)] text-[var(--fn-text)] shadow-sm' : 'text-[var(--fn-text-muted)]'
            }`}>
            {t === 'upcoming' ? 'Upcoming' : 'History'}
          </button>
        ))}
      </div>
      {entries.length === 0 ? (
        <p className="text-[var(--fn-text-muted)]">No bookings in this tab.</p>
      ) : (
        entries.map(({ booking, cls }) => (
          <div
            key={booking.id}
            className="mb-4 rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4">
            <p className="font-bold">{cls.title}</p>
            <p className="text-sm text-[var(--fn-text-muted)]">{formatClassDate(cls.startAt)}</p>
            <p className="mt-1 text-sm">{formatMoney(booking.price)} · {booking.status}</p>
            {booking.status === 'completed' ? (
              <Link href={`/review/${booking.id}`} className="mt-3 inline-block">
                <Button title="Leave review" size="sm" variant="outline" />
              </Link>
            ) : null}
          </div>
        ))
      )}
    </div>
  );
}
