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

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];
    for (let i = 0; i < startPadding; i++) {
      days.push(<div key={`pad-${i}`} className="aspect-square rounded-lg bg-[var(--fn-surface-muted)] opacity-30" />);
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
          className={`relative aspect-square rounded-lg border bg-[var(--fn-surface)] p-2 text-left transition-all hover:border-[var(--fn-primary)] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--fn-primary-muted)] ${
            isToday ? 'border-[var(--fn-primary)] ring-2 ring-[var(--fn-primary-muted)]' : 'border-[var(--fn-border)]'
          } ${isSelected ? 'border-[var(--fn-primary)] bg-[var(--fn-primary-muted)] shadow-md' : ''}`}
        >
          <span className={`text-sm font-semibold ${isToday || isSelected ? 'text-[var(--fn-primary)]' : 'text-[var(--fn-text)]'}`}>{i}</span>
          <div className="mt-1 space-y-1">
            {dayClasses.slice(0, 2).map((c) => (
              <div
                key={c.id}
                className="truncate rounded-md bg-[var(--fn-primary)] px-2 py-1 text-xs text-white"
              >
                {c.title}
              </div>
            ))}
            {dayClasses.length > 2 && <div className="text-xs text-[var(--fn-text-muted)]">+{dayClasses.length - 2} more</div>}
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
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="overflow-x-auto">
        <div className="flex min-w-[800px]">
          <div className="w-20 flex-shrink-0">
            <div className="h-12"></div>
            {hours.map((hour) => (
              <div key={hour} className="h-20 border-b border-[var(--fn-border)] px-2 text-xs text-[var(--fn-text-muted)]">
                {hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`}
              </div>
            ))}
          </div>
          {Array.from({ length: 7 }).map((_, idx) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + idx);
            const isToday = new Date().toDateString() === date.toDateString();
            const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
            const dayClasses = getClassesForDate(date);

            return (
              <div key={idx} className="flex-1">
                <button
                  type="button"
                  onClick={() => handleDateClick(date)}
                  className={`h-12 w-full border-b border-[var(--fn-border)] px-2 text-center transition-all hover:bg-[var(--fn-surface-muted)] ${
                    isToday ? 'bg-[var(--fn-primary-muted)]' : ''
                  } ${isSelected ? 'bg-[var(--fn-primary-muted)]' : ''}`}
                >
                  <div className="text-xs text-[var(--fn-text-muted)]">{FULL_DAYS[idx]}</div>
                  <div className={`text-sm font-semibold ${isToday || isSelected ? 'text-[var(--fn-primary)]' : ''}`}>{date.getDate()}</div>
                </button>
                <div className="relative">
                  {hours.map((hour) => (
                    <div key={hour} className="h-20 border-b border-[var(--fn-border)]"></div>
                  ))}
                  {dayClasses.map((c) => {
                    const start = new Date(c.startAt);
                    const top = start.getHours() * 80 + (start.getMinutes() * (80 / 60));
                    const duration = 60; // Assume 1 hour for now
                    const height = duration * (80 / 60);
                    return (
                      <button
                        type="button"
                        key={c.id}
                        className="absolute left-1 right-1 z-10 overflow-hidden rounded-lg border border-[var(--fn-primary)] bg-[var(--fn-primary-muted)] p-2 text-left text-xs shadow-md transition-all hover:scale-105 hover:shadow-lg"
                        style={{ top, height: Math.max(height, 60) }}
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setView('month')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              view === 'month' ? 'bg-[var(--fn-primary)] text-white shadow-md' : 'bg-[var(--fn-surface)] text-[var(--fn-text-muted)] hover:bg-[var(--fn-surface-muted)]'
            }`}
          >
            <CalendarIcon size={16} />
            Month
          </button>
          <button
            type="button"
            onClick={() => setView('week')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              view === 'week' ? 'bg-[var(--fn-primary)] text-white shadow-md' : 'bg-[var(--fn-surface)] text-[var(--fn-text-muted)] hover:bg-[var(--fn-surface-muted)]'
            }`}
          >
            <Clock size={16} />
            Week
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => (view === 'month' ? navigateMonth(-1) : navigateWeek(-1))}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--fn-surface)] text-[var(--fn-text-muted)] transition-all hover:bg-[var(--fn-surface-muted)] hover:text-[var(--fn-text)]"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-bold">
          {view === 'month'
            ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : `${new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay() + 6).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
        </h2>
        <button
          type="button"
          onClick={() => (view === 'month' ? navigateMonth(1) : navigateWeek(1))}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--fn-surface)] text-[var(--fn-text-muted)] transition-all hover:bg-[var(--fn-surface-muted)] hover:text-[var(--fn-text)]"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className={`grid gap-6 ${showSidePanel ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
        <div className={`${showSidePanel ? 'lg:col-span-2' : 'lg:col-span-1'} rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4`}>
          {view === 'month' ? (
            <div className="grid grid-cols-7 gap-2">
              {DAYS.map((d) => (
                <div key={d} className="pb-2 text-center text-sm font-semibold text-[var(--fn-text-muted)]">{d}</div>
              ))}
              {renderMonthView()}
            </div>
          ) : (
            renderWeekView()
          )}
        </div>

        {showSidePanel && selectedDate && (
          <div className="rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--fn-surface-muted)] text-[var(--fn-text-muted)] transition-all hover:bg-[var(--fn-border)] hover:text-[var(--fn-text)]"
              >
                <X size={16} />
              </button>
            </div>
            {selectedClasses.length === 0 ? (
              <p className="text-sm text-[var(--fn-text-muted)]">No classes scheduled for this day.</p>
            ) : (
              <div className="space-y-3">
                {selectedClasses.map((c) => (
                  <div key={c.id} className="rounded-lg border border-[var(--fn-border)] bg-[var(--fn-surface-muted)] p-3">
                    <p className="font-semibold text-[var(--fn-text)]">{c.title}</p>
                    <p className="text-sm text-[var(--fn-text-muted)]">{formatClassDate(c.startAt)}</p>
                    <p className="text-sm text-[var(--fn-primary)]">{formatMoney(c.price)}</p>
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
