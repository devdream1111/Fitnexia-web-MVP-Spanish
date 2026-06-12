'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAuth } from '@/contexts/auth-context';
import {
  apiCancelClass,
  apiCreateClass,
  apiGetClass,
  apiGetHomeFeed,
  apiGetMyClasses,
  apiSearchClasses,
  apiUpdateClass,
  type ClassSearchParams,
  type CreateClassBody,
} from '@/services/api';
import type { ClassListItem, HomeFeed } from '@/types/api';

export type NewClassInput = Omit<ClassListItem, 'id' | 'averageRating'> & { description?: string };

interface ClassesContextValue {
  classes: ClassListItem[];
  homeFeed: HomeFeed | null;
  loading: boolean;
  error: string | null;
  getClassById: (id: string) => ClassListItem | undefined;
  getClassesByInstructor: (instructorId: string) => ClassListItem[];
  fetchClassById: (id: string) => Promise<ClassListItem | null>;
  searchClasses: (params?: ClassSearchParams) => Promise<ClassListItem[]>;
  fetchHomeFeed: () => Promise<HomeFeed>;
  refreshMyClasses: () => Promise<ClassListItem[]>;
  addClass: (input: NewClassInput) => Promise<ClassListItem>;
  updateClass: (id: string, updates: Partial<ClassListItem>) => Promise<ClassListItem>;
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

export function ClassesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassListItem[]>([]);
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
      setClasses(sortByStartAt(data));
      return data;
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
    async (id: string) => {
      const cached = classes.find((c) => c.id === id);
      if (cached) return cached;
      try {
        const cls = await apiGetClass(id);
        setClasses((prev) => upsertCache(prev, [cls]));
        return cls;
      } catch {
        return null;
      }
    },
    [classes],
  );

  const getClassesByInstructor = useCallback(
    (instructorId: string) =>
      sortByStartAt(classes.filter((c) => c.instructor.id === instructorId)),
    [classes],
  );

  const searchClasses = useCallback(async (params: ClassSearchParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiSearchClasses(params);
      setClasses(sortByStartAt(result.data));
      return result.data;
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
      setHomeFeed(feed);
      const all = [...feed.recommended, ...feed.nearby, ...feed.popular];
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
      const body: CreateClassBody = {
        title: input.title,
        description: input.description,
        discipline: input.discipline,
        modality: input.modality,
        classFormat: input.classFormat,
        startAt: input.startAt,
        durationMinutes: input.durationMinutes,
        price: input.price,
        capacity: input.capacity,
        location: input.location,
        instructorId: user?.role === 'institution' ? input.instructor.id : undefined,
      };
      const created = await apiCreateClass(body);
      setClasses((prev) => upsertCache(prev, [created]));
      return created;
    },
    [user?.role],
  );

  const updateClass = useCallback(async (id: string, updates: Partial<ClassListItem> & { description?: string }) => {
    const body: Partial<CreateClassBody> = {};
    if (updates.title !== undefined) body.title = updates.title;
    if (updates.description !== undefined) body.description = updates.description;
    if (updates.discipline !== undefined) body.discipline = updates.discipline;
    if (updates.modality !== undefined) body.modality = updates.modality;
    if (updates.classFormat !== undefined) body.classFormat = updates.classFormat;
    if (updates.startAt !== undefined) body.startAt = updates.startAt;
    if (updates.durationMinutes !== undefined) body.durationMinutes = updates.durationMinutes;
    if (updates.price !== undefined) body.price = updates.price;
    if (updates.capacity !== undefined) body.capacity = updates.capacity;
    if (updates.location !== undefined) body.location = updates.location;

    const updated = await apiUpdateClass(id, body);
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    return updated;
  }, []);

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
      updateClass,
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
      updateClass,
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
