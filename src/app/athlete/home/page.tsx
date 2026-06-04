'use client';

import Link from 'next/link';

import { ClassCard } from '@/components/class-card';
import { useClasses } from '@/contexts/classes-context';

export default function AthleteHomePage() {
  const { classes } = useClasses();
  const nearby = classes.slice(0, 3);
  const recommended = [...classes].reverse().slice(0, 3);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--fn-text-muted)]">Good morning 👋</p>
          <h1 className="text-3xl font-extrabold">Find your next class</h1>
        </div>
        <span className="text-2xl">🔔</span>
      </div>

      <Link
        href="/athlete/search"
        className="mb-8 flex items-center gap-3 rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] px-4 py-3 text-[var(--fn-text-muted)]">
        🔍 Search classes, coaches, gyms...
      </Link>

      <h2 className="mb-3 text-lg font-bold">Nearby</h2>
      {nearby.map((c) => (
        <ClassCard key={c.id} item={c} />
      ))}

      <h2 className="mb-3 mt-6 text-lg font-bold">Recommended for you</h2>
      {recommended.map((c) => (
        <ClassCard key={`r-${c.id}`} item={c} />
      ))}
    </div>
  );
}
