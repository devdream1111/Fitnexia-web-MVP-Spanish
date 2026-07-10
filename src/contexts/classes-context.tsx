'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useAuth, type AuthUser } from '@/contexts/auth-context';
import {
  apiCancelClass,
  apiCreateClass,
  apiDeleteClassSeries,
  apiGetClass,
  apiGetClassSeries,
  apiGetClassSeriesInstances,
  apiGetHomeFeed,
  apiGetMyClasses,
  apiPauseClassSeries,
  apiResumeClassSeries,
  apiSearchClasses,
  apiUpdateClass,
  type ClassSearchParams,
  type CreateClassBody,
} from '@/services/api';
import type { ClassListItem, HomeFeed } from '@/types/api';
import { isClassInPast } from '@/utils/class-recurrence';
import {
  enrichClassesWithSeries,
  getSeriesIdFromClass,
  normalizeClassRecurrence,
  toApiEditScope,
  type RecurrenceEditScope,
} from '@/utils/class-series';

export type NewClassInput = Omit<ClassListItem, 'id' | 'averageRating'> & { description?: string };

export interface RecurringSeriesConfig {
  weekdays: number[];
  seriesStartDate: string;
  startTime: string;
}

export type { RecurrenceEditScope };

interface ClassesContextValue {
  classes: ClassListItem[];
  homeFeed: HomeFeed | null;
  loading: boolean;
  error: string | null;
  getClassById: (id: string) => ClassListItem | undefined;
  getClassesByInstructor: (instructorId: string) => ClassListItem[];
  fetchClassById: (id: string, options?: { force?: boolean }) => Promise<ClassListItem | null>;
  searchClasses: (params?: ClassSearchParams) => Promise<ClassListItem[]>;
  fetchHomeFeed: () => Promise<HomeFeed>;
  refreshMyClasses: () => Promise<ClassListItem[]>;
  addClass: (input: NewClassInput) => Promise<ClassListItem>;
  createRecurringSeries: (input: NewClassInput, config: RecurringSeriesConfig) => Promise<ClassListItem[]>;
  updateClass: (id: string, updates: Partial<ClassListItem> & { description?: string }) => Promise<ClassListItem>;
  updateClassWithRecurrenceScope: (
    id: string,
    updates: Partial<ClassListItem> & { description?: string },
    scope: RecurrenceEditScope,
  ) => Promise<ClassListItem[]>;
  pauseRecurrenceSeries: (seriesId: string) => Promise<void>;
  resumeRecurrenceSeries: (seriesId: string) => Promise<void>;
  deleteRecurrenceSeries: (seriesId: string) => Promise<{ cancelled: number; skipped: number }>;
  cancelClass: (id: string) => Promise<void>;
}

const ClassesContext = createContext<ClassesContextValue | null>(null);

function sortByStartAt(items: ClassListItem[]): ClassListItem[] {
  return [...items].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );
}

function upsertCache(prev: ClassListItem[], items: ClassListItem[]): ClassListItem[] {
  const map = new Map(prev.map((c) => [c.id, c]));
  items.forEach((c) => map.set(c.id, c));
  return sortByStartAt(Array.from(map.values()));
}

function buildCreateClassBody(input: NewClassInput, user: AuthUser | null): CreateClassBody {
  return {
    title: input.title,
    description: input.description,
    discipline: input.discipline,
    modality: input.modality,
    classFormat: input.classFormat,
    level: input.level,
    language: input.language,
    startAt: input.startAt,
    durationMinutes: input.durationMinutes,
    price: input.price,
    capacity: input.capacity,
    cancellationPolicyHours: input.cancellationPolicyHours,
    location: input.location,
    instructorId:
      user?.role === 'institution' && input.instructor?.id ? input.instructor.id : undefined,
    institutionId: user?.role === 'institution' ? user.institutionId : undefined,
  };
}

function buildUpdateClassBody(
  updates: Partial<ClassListItem> & { description?: string },
  editScope?: RecurrenceEditScope,
): Partial<CreateClassBody> {
  const body: Partial<CreateClassBody> = {};
  if (updates.title !== undefined) body.title = updates.title;
  if (updates.description !== undefined) body.description = updates.description;
  if (updates.discipline !== undefined) body.discipline = updates.discipline;
  if (updates.modality !== undefined) body.modality = updates.modality;
  if (updates.classFormat !== undefined) body.classFormat = updates.classFormat;
  if (updates.level !== undefined) body.level = updates.level;
  if (updates.language !== undefined) body.language = updates.language;
  if (updates.startAt !== undefined) body.startAt = updates.startAt;
  if (updates.durationMinutes !== undefined) body.durationMinutes = updates.durationMinutes;
  if (updates.price !== undefined) body.price = updates.price;
  if (updates.capacity !== undefined) body.capacity = updates.capacity;
  if (updates.cancellationPolicyHours !== undefined) {
    body.cancellationPolicyHours = updates.cancellationPolicyHours;
  }
  if (updates.location !== undefined) body.location = updates.location;
  if (editScope) body.editScope = toApiEditScope(editScope);
  return body;
}

export function ClassesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassListItem[]>([]);
  const classesRef = useRef(classes);
  classesRef.current = classes;
  const [homeFeed, setHomeFeed] = useState<HomeFeed | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshMyClasses = useCallback(async () => {
    if (!user || (user.role !== 'instructor' && user.role !== 'institution')) {
      return [];
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiGetMyClasses();
      const enriched = await enrichClassesWithSeries(data, apiGetClassSeries);
      const sorted = sortByStartAt(enriched);
      setClasses(sorted);
      return sorted;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load classes');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'instructor' || user?.role === 'institution') {
      refreshMyClasses();
    }
  }, [user?.id, user?.role, refreshMyClasses]);

  const getClassById = useCallback(
    (id: string) => classes.find((c) => c.id === id),
    [classes],
  );

  const fetchClassById = useCallback(
    async (id: string, options?: { force?: boolean }) => {
      if (!options?.force) {
        const cached = classesRef.current.find((c) => c.id === id);
        if (cached) return cached;
      }
      try {
        const cls = await apiGetClass(id);
        let enriched = normalizeClassRecurrence(cls);
        const seriesId = getSeriesIdFromClass(enriched);
        if (seriesId && (user?.role === 'instructor' || user?.role === 'institution')) {
          try {
            const series = await apiGetClassSeries(seriesId);
            enriched = normalizeClassRecurrence(cls, series);
          } catch {
            // Keep normalized metadata without series status.
          }
        }
        setClasses((prev) => upsertCache(prev, [enriched]));
        return enriched;
      } catch {
        return null;
      }
    },
    [user?.role],
  );

  const getClassesByInstructor = useCallback(
    (instructorId: string) =>
      sortByStartAt(classes.filter((c) => c.instructor?.id === instructorId)),
    [classes],
  );

  const searchClasses = useCallback(async (params: ClassSearchParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiSearchClasses(params);
      const enriched = result.data.map((item) => normalizeClassRecurrence(item));
      setClasses(sortByStartAt(enriched));
      return enriched;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHomeFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const feed = await apiGetHomeFeed();
      const normalizedFeed: HomeFeed = {
        recommended: feed.recommended.map((item) => normalizeClassRecurrence(item)),
        nearby: feed.nearby.map((item) => normalizeClassRecurrence(item)),
        popular: feed.popular.map((item) => normalizeClassRecurrence(item)),
      };
      setHomeFeed(normalizedFeed);
      const all = [...normalizedFeed.recommended, ...normalizedFeed.nearby, ...normalizedFeed.popular];
      setClasses((prev) => upsertCache(prev, all));
      return feed;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load feed');
      return { recommended: [], nearby: [], popular: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  const addClass = useCallback(
    async (input: NewClassInput) => {
      const created = await apiCreateClass(buildCreateClassBody(input, user));
      const normalized = normalizeClassRecurrence(created);
      setClasses((prev) => upsertCache(prev, [normalized]));
      return normalized;
    },
    [user],
  );

  const createRecurringSeries = useCallback(
    async (input: NewClassInput, config: RecurringSeriesConfig) => {
      if (!user || (user.role !== 'instructor' && user.role !== 'institution')) {
        throw new Error('Unauthorized');
      }

      if (!config.weekdays.length) {
        throw new Error('No instances to publish');
      }

      const body: CreateClassBody = {
        ...buildCreateClassBody(input, user),
        recurrence: {
          enabled: true,
          frequency: 'weekly',
          weekdays: config.weekdays,
        },
      };

      const firstInstance = await apiCreateClass(body);
      const seriesId = getSeriesIdFromClass(firstInstance);
      if (!seriesId) {
        const normalized = normalizeClassRecurrence(firstInstance);
        setClasses((prev) => upsertCache(prev, [normalized]));
        return [normalized];
      }

      const refreshed = await refreshMyClasses();
      const seriesInstances = refreshed.filter((item) => getSeriesIdFromClass(item) === seriesId);
      return seriesInstances.length ? seriesInstances : [normalizeClassRecurrence(firstInstance)];
    },
    [user, refreshMyClasses],
  );

  const updateClass = useCallback(async (id: string, updates: Partial<ClassListItem> & { description?: string }) => {
    const updated = await apiUpdateClass(id, buildUpdateClassBody(updates));
    const normalized = normalizeClassRecurrence(updated);
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...normalized } : c)));
    return normalized;
  }, []);

  const updateClassWithRecurrenceScope = useCallback(
    async (
      id: string,
      updates: Partial<ClassListItem> & { description?: string },
      scope: RecurrenceEditScope,
    ) => {
      const seriesId = getSeriesIdFromClass(classes.find((c) => c.id === id) ?? {});
      const body = buildUpdateClassBody(updates, seriesId ? scope : undefined);
      const updated = await apiUpdateClass(id, body);
      const refreshed = await refreshMyClasses();
      const normalized = normalizeClassRecurrence(updated);

      if (scope === 'single' || !seriesId) {
        return [normalized];
      }

      const anchor = refreshed.find((c) => c.id === id);
      if (!anchor) return [normalized];

      const anchorTime = new Date(anchor.startAt).getTime();
      return refreshed.filter((item) => {
        if (getSeriesIdFromClass(item) !== seriesId) return false;
        if (isClassInPast(item.startAt)) return false;
        return new Date(item.startAt).getTime() >= anchorTime;
      });
    },
    [classes, refreshMyClasses],
  );

  const pauseRecurrenceSeries = useCallback(async (seriesId: string) => {
    await apiPauseClassSeries(seriesId);
    await refreshMyClasses();
  }, [refreshMyClasses]);

  const resumeRecurrenceSeries = useCallback(async (seriesId: string) => {
    await apiResumeClassSeries(seriesId);
    await refreshMyClasses();
  }, [refreshMyClasses]);

  const deleteRecurrenceSeries = useCallback(async (seriesId: string) => {
    let futureIds: string[] = [];
    try {
      const { data } = await apiGetClassSeriesInstances(seriesId);
      futureIds = data
        .filter((instance) => !isClassInPast(instance.startAt))
        .map((instance) => instance.id);
    } catch {
      futureIds = classes
        .filter((item) => getSeriesIdFromClass(item) === seriesId && !isClassInPast(item.startAt))
        .map((item) => item.id);
    }

    await apiDeleteClassSeries(seriesId);
    const refreshed = await refreshMyClasses();
    const remaining = futureIds.filter((id) => refreshed.some((item) => item.id === id));
    const skipped = remaining.length;
    const cancelled = futureIds.length - skipped;
    return { cancelled, skipped };
  }, [classes, refreshMyClasses]);

  const cancelClass = useCallback(async (id: string) => {
    await apiCancelClass(id);
    setClasses((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      classes,
      homeFeed,
      loading,
      error,
      getClassById,
      getClassesByInstructor,
      fetchClassById,
      searchClasses,
      fetchHomeFeed,
      refreshMyClasses,
      addClass,
      createRecurringSeries,
      updateClass,
      updateClassWithRecurrenceScope,
      pauseRecurrenceSeries,
      resumeRecurrenceSeries,
      deleteRecurrenceSeries,
      cancelClass,
    }),
    [
      classes,
      homeFeed,
      loading,
      error,
      getClassById,
      getClassesByInstructor,
      fetchClassById,
      searchClasses,
      fetchHomeFeed,
      refreshMyClasses,
      addClass,
      createRecurringSeries,
      updateClass,
      updateClassWithRecurrenceScope,
      pauseRecurrenceSeries,
      resumeRecurrenceSeries,
      deleteRecurrenceSeries,
      cancelClass,
    ],
  );

  return <ClassesContext.Provider value={value}>{children}</ClassesContext.Provider>;
}

export function useClasses() {
  const ctx = useContext(ClassesContext);
  if (!ctx) throw new Error('useClasses must be used within ClassesProvider');
  return ctx;
}
