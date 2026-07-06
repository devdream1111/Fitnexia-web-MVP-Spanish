import type { ClassListItem, ClassSeries } from '@/types/api';
import type { ClassEditScope } from '@/services/api';

/** Matches backend HORIZON_WEEKS in class-series.service.js */
export const SERIES_HORIZON_WEEKS = 8;

export type RecurrenceEditScope = 'single' | 'following';

export function getSeriesIdFromClass(item: Pick<ClassListItem, 'seriesId' | 'recurrenceSeriesId' | 'recurrence'>): string | undefined {
  return item.recurrenceSeriesId ?? item.seriesId ?? item.recurrence?.seriesId ?? undefined;
}

export function isRecurringClass(item: Pick<ClassListItem, 'seriesId' | 'recurrenceSeriesId' | 'recurrence'>): boolean {
  if (getSeriesIdFromClass(item)) return true;
  return item.recurrence?.enabled === true;
}

export function toApiEditScope(scope: RecurrenceEditScope): ClassEditScope {
  return scope === 'single' ? 'this' : 'following';
}

export function formatSeriesTime(timeOfDay: string): string {
  return timeOfDay.slice(0, 5);
}

export function normalizeClassRecurrence(
  item: ClassListItem,
  series?: Pick<ClassSeries, 'status' | 'weekdays'> | null,
): ClassListItem {
  const seriesId = getSeriesIdFromClass(item);
  if (!seriesId && !item.recurrence?.enabled) return item;

  const paused = series ? series.status === 'paused' : item.recurrence?.paused === true;
  const weekdays = series?.weekdays ?? item.recurrence?.weekdays ?? [];

  return {
    ...item,
    seriesId,
    recurrenceSeriesId: seriesId,
    recurrence: {
      enabled: true,
      frequency: 'weekly',
      weekdays,
      until: item.recurrence?.until ?? null,
      paused,
      seriesId,
    },
  };
}

export async function enrichClassesWithSeries(
  items: ClassListItem[],
  fetchSeries: (seriesId: string) => Promise<ClassSeries>,
): Promise<ClassListItem[]> {
  const normalized = items.map((item) => normalizeClassRecurrence(item));
  const seriesIds = [
    ...new Set(normalized.map((item) => getSeriesIdFromClass(item)).filter(Boolean)),
  ] as string[];

  if (!seriesIds.length) return normalized;

  const seriesMap = new Map<string, ClassSeries>();
  await Promise.all(
    seriesIds.map(async (id) => {
      try {
        seriesMap.set(id, await fetchSeries(id));
      } catch {
        // Series may be deleted or inaccessible — keep normalized recurrence metadata.
      }
    }),
  );

  return normalized.map((item) => {
    const seriesId = getSeriesIdFromClass(item);
    if (!seriesId) return item;
    const series = seriesMap.get(seriesId);
    return series ? normalizeClassRecurrence(item, series) : item;
  });
}

export function seriesStatusLabel(status: ClassSeries['status']): string | undefined {
  if (status === 'paused') return 'paused';
  if (status === 'deleted') return 'deleted';
  return undefined;
}
