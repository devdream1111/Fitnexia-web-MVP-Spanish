'use client';

import { useState } from 'react';
import { Calendar } from '@/components/calendar/Calendar';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { getLinkedInstructorId } from '@/utils/instructor';
import { formatClassDate, formatMoney } from '@/utils/format';
import { INSTRUCTOR_LABELS } from '@/constants/labels';

export default function InstructorCalendarPage() {
  const { user } = useAuth();
  const { getClassesByInstructor } = useClasses();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const mine = getClassesByInstructor(getLinkedInstructorId(user));

  const getClassesForDate = (date: Date) => {
    return mine.filter((c) => {
      if (!c?.startAt) return false;
      const cDate = new Date(c.startAt);
      return cDate.toDateString() === date.toDateString();
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">{INSTRUCTOR_LABELS.calendar.yourCalendar}</h1>
      <Calendar 
        classes={mine} 
        onDateClick={(date) => setSelectedDate(date)}
        showSidePanel={false}
      />
      
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="fn-layout-narrow w-full rounded-2xl bg-[var(--fn-surface)] p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {selectedDate.toLocaleDateString('es-UY', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
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
                <p className="text-sm text-[var(--fn-text-muted)]">No hay clases programadas para este día.</p>
              ) : (
                getClassesForDate(selectedDate).map(c => (
                  <div key={c.id} className="rounded-lg border border-[var(--fn-border)] bg-[var(--fn-surface-muted)] p-3">
                    <p className="font-semibold text-[var(--fn-text)]">{c.title}</p>
                    <p className="text-sm text-[var(--fn-text-muted)]">{formatClassDate(c.startAt)}</p>
                    <p className="text-sm text-[var(--fn-primary)]">{formatMoney(c.price)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
