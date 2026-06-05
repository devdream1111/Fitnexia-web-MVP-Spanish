'use client';

import Link from 'next/link';
import { Search, Bell } from 'lucide-react';

import { ClassCard } from '@/components/class-card';
import { useClasses } from '@/contexts/classes-context';

export default function AthleteHomePage() {
  const { classes } = useClasses();
  const nearby = classes.slice(0, 4);
  const recommended = [...classes].reverse().slice(0, 4);

  return (
    <div className="space-y-10">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--fn-text-muted)]">Good morning!</p>
          <h1 className="text-3xl font-extrabold md:text-4xl">Find your next class</h1>
        </div>
        <button
          type="button"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--fn-surface)] text-[var(--fn-text-muted)] shadow-sm transition-all hover:bg-[var(--fn-surface-muted)] hover:text-[var(--fn-text)]"
        >
          <Bell size={22} />
        </button>
      </div>

      <Link
        href="/athlete/search"
        className="flex items-center gap-3 rounded-2xl border-2 border-[var(--fn-border)] bg-[var(--fn-surface)] px-6 py-5 text-lg text-[var(--fn-text-muted)] shadow-sm transition-all hover:border-[var(--fn-primary)] hover:shadow-md"
      >
        <Search size={22} />
        Search classes, coaches, gyms...
      </Link>

      <section className="space-y-4">
        <h2 className="text-xl font-bold md:text-2xl">Nearby</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {nearby.map((c) => (
            <ClassCard key={c.id} item={c} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold md:text-2xl">Recommended for you</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recommended.map((c) => (
            <ClassCard key={`r-${c.id}`} item={c} />
          ))}
        </div>
      </section>
    </div>
  );
}
