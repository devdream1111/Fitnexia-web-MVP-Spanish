'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { formatClassDate, formatMoney, isClassOnCalendarDay, parseClassStartAt } from '@/utils/format';
import { INSTRUCTOR_LABELS } from '@/constants/labels';
import type { ClassListItem, Money } from '@/types/api';

export type CalendarLabels = {
  today: string;
  month: string;
  week?: string;
  noEventsDay: string;
  moreEvents: (count: number) => string;
  weekdayShort: readonly string[];
  weekdayFull?: readonly string[];
};

interface CalendarProps {
  classes: ClassListItem[];
  onDateClick?: (date: Date) => void;
  showSidePanel?: boolean;
  /** Jump the calendar to the month of the first booking when data loads */
  focusDate?: Date;
  labels?: CalendarLabels;
  locale?: string;
}

const DEFAULT_LABELS: CalendarLabels = INSTRUCTOR_LABELS.calendar;
const DEFAULT_LOCALE = 'es-ES';
const MAX_VISIBLE_EVENTS = 3;

function uniqueClassesById(items: ClassListItem[]): ClassListItem[] {
  const seen = new Set<string>();
  return items.filter((c) => {
    if (!c?.id || seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });
}

function formatEventTime(iso: string, locale: string): string {
  const d = parseClassStartAt(iso);
  return d.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

function buildMonthGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - startOffset + 1;
    return new Date(year, month, dayNumber);
  });
}

export function CalendarEventChip({
  item,
  locale = DEFAULT_LOCALE,
  compact,
}: {
  item: ClassListItem;
  locale?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`fn-calendar-event-chip${compact ? ' fn-calendar-event-chip--compact' : ''}`}
      title={`${formatEventTime(item.startAt, locale)} · ${item.title}`}
    >
      <span className="fn-calendar-event-chip__time">{formatEventTime(item.startAt, locale)}</span>
      <span className="fn-calendar-event-chip__title">{item.title}</span>
    </div>
  );
}

export function CalendarEventCard({
  item,
  locale = DEFAULT_LOCALE,
  price,
  children,
}: {
  item: ClassListItem;
  locale?: string;
  price?: Money;
  children?: ReactNode;
}) {
  return (
    <article className="fn-calendar-event-card">
      <div className="fn-calendar-event-card__accent" aria-hidden="true" />
      <div className="fn-calendar-event-card__body">
        <p className="fn-calendar-event-card__title">{item.title}</p>
        <p className="fn-calendar-event-card__meta">{formatClassDate(item.startAt)}</p>
        <p className="fn-calendar-event-card__price">{formatMoney(price ?? item.price)}</p>
        {children ? <div className="fn-calendar-event-card__footer">{children}</div> : null}
      </div>
    </article>
  );
}

export function Calendar({
  classes,
  onDateClick,
  showSidePanel = true,
  focusDate,
  labels = DEFAULT_LABELS,
  locale = DEFAULT_LOCALE,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => focusDate ?? new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    if (!focusDate) return;
    setCurrentDate((prev) => {
      if (
        prev.getFullYear() === focusDate.getFullYear() &&
        prev.getMonth() === focusDate.getMonth()
      ) {
        return prev;
      }
      return new Date(focusDate.getFullYear(), focusDate.getMonth(), 1);
    });
  }, [focusDate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthGrid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const getClassesForDate = (date: Date) => {
    return uniqueClassesById(
      classes.filter((c) => {
        if (!c?.startAt) return false;
        return isClassOnCalendarDay(c.startAt, date);
      }),
    ).sort((a, b) => parseClassStartAt(a.startAt).getTime() - parseClassStartAt(b.startAt).getTime());
  };

  const handleDateClick = (date: Date) => {
    if (date.getMonth() !== month || date.getFullYear() !== year) {
      setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
    }
    setSelectedDate(date);
    if (onDateClick) onDateClick(date);
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
    if (onDateClick) onDateClick(now);
  };

  const navigateMonth = (delta: number) => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const selectedClasses = selectedDate ? getClassesForDate(selectedDate) : [];
  const monthTitle = currentDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

  return (
    <div className="fn-calendar">
      <header className="fn-calendar-toolbar">
        <div className="fn-calendar-toolbar__left">
          <button type="button" onClick={goToToday} className="fn-calendar-btn fn-calendar-btn--today">
            {labels.today}
          </button>
          <div className="fn-calendar-nav">
            <button
              type="button"
              onClick={() => navigateMonth(-1)}
              className="fn-calendar-nav__btn"
              aria-label="Mes anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => navigateMonth(1)}
              className="fn-calendar-nav__btn"
              aria-label="Mes siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <h2 className="fn-calendar-toolbar__title">{monthTitle}</h2>
        </div>
        <span className="fn-calendar-view-badge">{labels.month}</span>
      </header>

      <div className={`fn-calendar-layout${showSidePanel ? ' fn-calendar-layout--with-panel' : ''}`}>
        <div className="fn-calendar-grid-wrap">
          <div className="fn-calendar-weekdays" role="row">
            {labels.weekdayShort.map((d) => (
              <div key={d} className="fn-calendar-weekday" role="columnheader">
                {d}
              </div>
            ))}
          </div>
          <div className="fn-calendar-grid" role="grid">
            {monthGrid.map((date) => {
              const dayClasses = getClassesForDate(date);
              const inCurrentMonth = date.getMonth() === month;
              const isToday = isSameDay(date, today);
              const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
              const visibleEvents = dayClasses.slice(0, MAX_VISIBLE_EVENTS);
              const hiddenCount = dayClasses.length - visibleEvents.length;

              return (
                <button
                  type="button"
                  key={date.toISOString()}
                  role="gridcell"
                  onClick={() => handleDateClick(date)}
                  className={[
                    'fn-calendar-day',
                    !inCurrentMonth ? 'fn-calendar-day--outside' : '',
                    isToday ? 'fn-calendar-day--today' : '',
                    isSelected ? 'fn-calendar-day--selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className="fn-calendar-day__number">{date.getDate()}</span>
                  <div className="fn-calendar-day__events">
                    {visibleEvents.map((c) => (
                      <CalendarEventChip key={c.id} item={c} locale={locale} compact />
                    ))}
                    {hiddenCount > 0 ? (
                      <span className="fn-calendar-day__more">{labels.moreEvents(hiddenCount)}</span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {showSidePanel && selectedDate ? (
          <aside className="fn-calendar-side-panel">
            <div className="fn-calendar-side-panel__header">
              <h3 className="fn-calendar-side-panel__title">
                {selectedDate.toLocaleDateString(locale, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="fn-calendar-icon-btn"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
            {selectedClasses.length === 0 ? (
              <p className="fn-calendar-side-panel__empty">{labels.noEventsDay}</p>
            ) : (
              <div className="fn-calendar-side-panel__list">
                {selectedClasses.map((c) => (
                  <CalendarEventCard key={c.id} item={c} locale={locale} />
                ))}
              </div>
            )}
          </aside>
        ) : null}
      </div>
    </div>
  );
}
