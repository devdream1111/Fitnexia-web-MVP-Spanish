'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, X } from 'lucide-react';
import { formatClassDate, formatMoney } from '@/data/mock';
import type { ClassListItem } from '@/types/api';

interface CalendarProps {
  classes: ClassListItem[];
  onDateClick?: (date: Date) => void;
  showSidePanel?: boolean;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function Calendar({ classes, onDateClick, showSidePanel = true }: CalendarProps) {
  const [view, setView] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getClassesForDate = (date: Date) => {
    return classes.filter((c) => {
      const cDate = new Date(c.startAt);
      return cDate.toDateString() === date.toDateString();
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (onDateClick) onDateClick(date);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];
    for (let i = 0; i < startPadding; i++) {
      days.push(<div key={`pad-${i}`} className="h-20 rounded-sm" />);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dayClasses = getClassesForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();
      const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();

      days.push(
        <button
          type="button"
          key={i}
          onClick={() => handleDateClick(date)}
          className={`relative h-20 flex flex-col border border-transparent p-1 text-left transition-all hover:bg-[var(--fn-surface-muted)] ${
            isSelected ? 'bg-[var(--fn-primary-muted)]' : ''
          }`}
        >
          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-all ${
            isToday ? 'bg-[var(--fn-primary)] text-white' : isSelected ? 'font-bold text-[var(--fn-primary)]' : 'text-[var(--fn-text)]'
          }`}>{i}</span>
          <div className="mt-1 flex-1 overflow-hidden">
            {dayClasses.slice(0, 2).map((c) => (
              <div
                key={c.id}
                className="mb-0.5 truncate rounded-sm bg-[var(--fn-primary)] px-1 py-0.5 text-[9px] text-white"
              >
                {c.title}
              </div>
            ))}
            {dayClasses.length > 2 && <div className="text-[9px] text-[var(--fn-text-muted)]">+{dayClasses.length - 2} more</div>}
          </div>
        </button>
      );
    }
    return days;
  };

  const renderWeekView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const day = currentDate.getDate();
    const startOfWeek = new Date(year, month, day - currentDate.getDay());
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // Show 8 AM - 8 PM instead of full 24h

    return (
      <div className="overflow-x-auto">
        <div className="flex min-w-[900px]">
          <div className="w-24 flex-shrink-0">
            <div className="h-10"></div>
            {hours.map((hour) => (
              <div key={hour} className="h-12 border-b border-[var(--fn-border)] px-2 text-right text-[10px] text-[var(--fn-text-muted)]">
                {hour === 12 ? '12 PM' : hour < 12 ? `${hour} AM` : `${hour - 12} PM`}
              </div>
            ))}
          </div>
          {Array.from({ length: 7 }).map((_, idx) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + idx);
            const isToday = new Date().toDateString() === date.toDateString();
            const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
            const dayClasses = getClassesForDate(date).filter(c => {
              const h = new Date(c.startAt).getHours();
              return h >= 8 && h < 20; // Only show classes 8 AM - 8 PM
            });

            return (
              <div key={idx} className="flex-1 border-l border-[var(--fn-border)]">
                <button
                  type="button"
                  onClick={() => handleDateClick(date)}
                  className={`flex h-10 w-full flex-col items-center justify-center border-b border-[var(--fn-border)] text-center transition-all hover:bg-[var(--fn-surface-muted)] ${
                    isSelected ? 'bg-[var(--fn-primary-muted)]' : ''
                  }`}
                >
                  <div className="text-[10px] text-[var(--fn-text-muted)]">{FULL_DAYS[idx]}</div>
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    isToday ? 'bg-[var(--fn-primary)] text-white' : isSelected ? 'font-bold text-[var(--fn-primary)]' : ''
                  }`}>{date.getDate()}</div>
                </button>
                <div className="relative">
                  {hours.map((hour) => (
                    <div key={hour} className="h-12 border-b border-[var(--fn-border)]"></div>
                  ))}
                  {dayClasses.map((c) => {
                    const start = new Date(c.startAt);
                    const hourOffset = start.getHours() - 8;
                    const top = hourOffset * 48 + (start.getMinutes() * (48 / 60));
                    const duration = 60; // Assume 1 hour for now
                    const height = duration * (48 / 60);
                    return (
                      <button
                        type="button"
                        key={c.id}
                        className="absolute left-1 right-1 z-10 overflow-hidden rounded-md border-l-4 border-[var(--fn-primary)] bg-[var(--fn-primary-muted)] px-1.5 py-0.5 text-left text-[10px] transition-all"
                        style={{ top, height: Math.max(height, 36) }}
                      >
                        <div className="font-semibold text-[var(--fn-primary)]">{c.title}</div>
                        <div className="text-[var(--fn-primary-text)]">{formatClassDate(c.startAt)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const navigateMonth = (delta: number) => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const navigateWeek = (delta: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + delta * 7);
      return newDate;
    });
  };

  const selectedClasses = selectedDate ? getClassesForDate(selectedDate) : [];

  return (
    <div className="space-y-4">
      {/* Google Calendar-style header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--fn-border)] pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToToday}
            className="rounded-md border border-[var(--fn-border)] bg-[var(--fn-surface)] px-4 py-2 text-sm font-medium text-[var(--fn-text)] transition-all hover:bg-[var(--fn-surface-muted)]"
          >
            Today
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => (view === 'month' ? navigateMonth(-1) : navigateWeek(-1))}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--fn-text-muted)] transition-all hover:bg-[var(--fn-surface-muted)] hover:text-[var(--fn-text)]"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => (view === 'month' ? navigateMonth(1) : navigateWeek(1))}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--fn-text-muted)] transition-all hover:bg-[var(--fn-surface-muted)] hover:text-[var(--fn-text)]"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <h2 className="ml-2 text-xl font-semibold">
            {view === 'month'
              ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
              : `${new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay() + 6).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
          </h2>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-[var(--fn-surface-muted)] p-1">
          <button
            type="button"
            onClick={() => setView('month')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
              view === 'month' ? 'bg-[var(--fn-surface)] text-[var(--fn-text)]' : 'text-[var(--fn-text-muted)] hover:text-[var(--fn-text)]'
            }`}
          >
            <CalendarIcon size={16} />
            Month
          </button>
          <button
            type="button"
            onClick={() => setView('week')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
              view === 'week' ? 'bg-[var(--fn-surface)] text-[var(--fn-text)]' : 'text-[var(--fn-text-muted)] hover:text-[var(--fn-text)]'
            }`}
          >
            <Clock size={16} />
            Week
          </button>
        </div>
      </div>

      <div className={`grid gap-6 ${showSidePanel ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
        <div className={`${showSidePanel ? 'lg:col-span-2' : 'lg:col-span-1'} rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4`}>
          {view === 'month' ? (
            <div className="grid grid-cols-7 border-b border-[var(--fn-border)]">
              {DAYS.map((d) => (
                <div key={d} className="pb-2 text-center text-sm font-medium text-[var(--fn-text-muted)]">{d}</div>
              ))}
            </div>
          ) : null}
          
          {view === 'month' ? (
            <div className="grid grid-cols-7 border-x border-b border-[var(--fn-border)]">
              {renderMonthView()}
            </div>
          ) : (
            renderWeekView()
          )}
        </div>

        {showSidePanel && selectedDate && (
          <div className="rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--fn-text-muted)] transition-all hover:bg-[var(--fn-surface-muted)] hover:text-[var(--fn-text)]"
              >
                <X size={16} />
              </button>
            </div>
            {selectedClasses.length === 0 ? (
              <p className="text-sm text-[var(--fn-text-muted)]">No classes scheduled for this day.</p>
            ) : (
              <div className="space-y-3">
                {selectedClasses.map((c) => (
                  <div key={c.id} className="rounded-lg border border-[var(--fn-border)] bg-[var(--fn-surface-muted)] p-4">
                    <p className="font-semibold text-[var(--fn-text)]">{c.title}</p>
                    <p className="text-sm text-[var(--fn-text-muted)]">{formatClassDate(c.startAt)}</p>
                    <p className="text-sm text-[var(--fn-primary)] font-medium">{formatMoney(c.price)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
