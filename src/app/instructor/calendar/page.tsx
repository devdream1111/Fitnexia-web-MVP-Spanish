'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';

import { ClassCard } from '@/components/class-card';
import { Calendar } from '@/components/calendar/Calendar';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { filterClassesByScheduleTab } from '@/utils/calendar';
import { formatClassDate, formatMoney, isClassOnCalendarDay } from '@/utils/format';
import { getLinkedInstructorId } from '@/utils/instructor';
import { GENERAL_LABELS, INSTRUCTOR_LABELS } from '@/constants/labels';

export default function InstructorCalendarPage() {
  const { user } = useAuth();
  const { getClassesByInstructor } = useClasses();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showCalendar, setShowCalendar] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const allMine = getClassesByInstructor(getLinkedInstructorId(user));

  const filteredClasses = useMemo(
    () => filterClassesByScheduleTab(allMine, tab),
    [allMine, tab],
  );

  useEffect(() => {
    setSelectedDate(null);
  }, [tab]);

  const calendarFocusDate = useMemo(() => {
    const dates = filteredClasses
      .map((c) => new Date(c.startAt))
      .filter((d) => !Number.isNaN(d.getTime()));
    if (dates.length === 0) return undefined;
    dates.sort((a, b) =>
      tab === 'upcoming' ? a.getTime() - b.getTime() : b.getTime() - a.getTime(),
    );
    return dates[0];
  }, [filteredClasses, tab]);

  const getClassesForDate = (date: Date) => {
    return filteredClasses.filter((c) => isClassOnCalendarDay(c.startAt, date));
  };

  const sortedList = useMemo(() => {
    return [...filteredClasses].sort((a, b) => {
      const ta = new Date(a.startAt).getTime();
      const tb = new Date(b.startAt).getTime();
      return tab === 'upcoming' ? ta - tb : tb - ta;
    });
  }, [filteredClasses, tab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold">{INSTRUCTOR_LABELS.calendar.yourCalendar}</h1>
        <button
          type="button"
          onClick={() => setShowCalendar(!showCalendar)}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
            showCalendar
              ? 'bg-[var(--fn-primary)] text-white shadow-md'
              : 'bg-[var(--fn-surface)] text-[var(--fn-text-muted)] hover:bg-[var(--fn-surface-muted)] hover:text-[var(--fn-text)]'
          }`}
        >
          <CalendarIcon size={16} />
          {showCalendar ? GENERAL_LABELS.hideCalendar : GENERAL_LABELS.showCalendar}
        </button>
      </div>

      <div className="flex rounded-xl bg-[var(--fn-surface-muted)] p-1">
        {(['upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
              tab === t
                ? 'bg-[var(--fn-surface)] text-[var(--fn-text)] shadow-sm'
                : 'text-[var(--fn-text-muted)]'
            }`}
          >
            {t === 'upcoming' ? GENERAL_LABELS.upcoming : GENERAL_LABELS.history}
          </button>
        ))}
      </div>

      {showCalendar ? (
        <Calendar
          classes={filteredClasses}
          focusDate={calendarFocusDate}
          onDateClick={(date) => setSelectedDate(date)}
          showSidePanel={false}
        />
      ) : null}

      {selectedDate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="fn-layout-narrow w-full rounded-2xl bg-[var(--fn-surface)] p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {selectedDate.toLocaleDateString('es-UY', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--fn-surface-muted)] text-[var(--fn-text-muted)] transition-all hover:bg-[var(--fn-border)] hover:text-[var(--fn-text)]"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              {getClassesForDate(selectedDate).length === 0 ? (
                <p className="text-sm text-[var(--fn-text-muted)]">
                  {tab === 'upcoming'
                    ? 'No hay clases próximas este día.'
                    : 'No hay clases en el historial para este día.'}
                </p>
              ) : (
                getClassesForDate(selectedDate).map((c) => (
                  <div
                    key={c.id}
                    className="rounded-lg border border-[var(--fn-border)] bg-[var(--fn-surface-muted)] p-3"
                  >
                    <p className="font-semibold text-[var(--fn-text)]">{c.title}</p>
                    <p className="text-sm text-[var(--fn-text-muted)]">{formatClassDate(c.startAt)}</p>
                    <p className="text-sm text-[var(--fn-primary)]">{formatMoney(c.price)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}

      {sortedList.length === 0 ? (
        <p className="text-[var(--fn-text-muted)]">{GENERAL_LABELS.noBookingsInTab}</p>
      ) : (
        <div className="grid gap-4">
          {sortedList.map((c) => (
            <ClassCard key={c.id} item={c} showEdit editHref={`/instructor/edit-class/${c.id}`} />
          ))}
        </div>
      )}

      {tab === 'upcoming' ? (
        <p className="text-center text-sm text-[var(--fn-text-muted)]">
          <Link href="/instructor/create-class" className="font-semibold text-[var(--fn-primary)]">
            {INSTRUCTOR_LABELS.classForm.newClass}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
