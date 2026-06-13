'use client';

import React, { createContext, useCallback, useContext, useMemo, useRef } from 'react';

import type { Instructor } from '@/types/api';

interface InstructorsContextValue {
  getCachedInstructor: (id: string) => Instructor | undefined;
  cacheInstructor: (instructor: Instructor) => void;
}

const InstructorsContext = createContext<InstructorsContextValue | null>(null);

/** Minimal instructor record from class list / detail payloads */
export function instructorFromSummary(
  summary: Pick<Instructor, 'id' | 'displayName' | 'photoUrl'>,
  extras?: Partial<Pick<Instructor, 'verified' | 'averageRating' | 'reviewCount'>>,
): Instructor {
  return {
    id: summary.id,
    userId: '',
    displayName: summary.displayName,
    photoUrl: summary.photoUrl,
    disciplines: [],
    verified: extras?.verified ?? false,
    availableNow: false,
    averageRating: extras?.averageRating ?? 0,
    reviewCount: extras?.reviewCount ?? 0,
  };
}

export function InstructorsProvider({ children }: { children: React.ReactNode }) {
  const cacheRef = useRef<Map<string, Instructor>>(new Map());

  const getCachedInstructor = useCallback((id: string) => cacheRef.current.get(id), []);

  const cacheInstructor = useCallback((instructor: Instructor) => {
    cacheRef.current.set(instructor.id, instructor);
  }, []);

  const value = useMemo(
    () => ({ getCachedInstructor, cacheInstructor }),
    [getCachedInstructor, cacheInstructor],
  );

  return <InstructorsContext.Provider value={value}>{children}</InstructorsContext.Provider>;
}

export function useInstructors() {
  const ctx = useContext(InstructorsContext);
  if (!ctx) throw new Error('useInstructors must be used within InstructorsProvider');
  return ctx;
}
