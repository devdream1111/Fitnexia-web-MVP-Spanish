'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import {
  MOCK_INSTITUTIONS,
  MOCK_PENDING_VERIFICATIONS,
  MOCK_REPORTED_REVIEWS,
  MOCK_USERS,
  updateMockInstructor,
  updateMockInstitution,
} from '@/data/mock';
import type { AdminUser, Institution, PendingVerification, ReportedReview } from '@/types/api';

interface AdminContextValue {
  users: AdminUser[];
  institutions: Institution[];
  pendingVerifications: PendingVerification[];
  reportedReviews: ReportedReview[];
  toggleUserVerified: (id: string) => void;
  toggleUserSuspended: (id: string) => void;
  verifyPending: (id: string, type: 'instructor' | 'institution') => void;
  rejectPending: (id: string) => void;
  verifyInstitution: (id: string) => void;
  rejectInstitution: (id: string) => void;
  dismissReportedReview: (id: string) => void;
  removeReportedReview: (id: string) => string | undefined;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<AdminUser[]>(() => [...MOCK_USERS]);
  const [institutions, setInstitutions] = useState<Institution[]>(() =>
    MOCK_INSTITUTIONS.map((g) => ({ ...g })),
  );
  const [pendingVerifications, setPendingVerifications] = useState<PendingVerification[]>(() => [
    ...MOCK_PENDING_VERIFICATIONS,
  ]);
  const [reportedReviews, setReportedReviews] = useState<ReportedReview[]>(() => [
    ...MOCK_REPORTED_REVIEWS,
  ]);

  const toggleUserVerified = useCallback((id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, verified: !u.verified } : u)),
    );
  }, []);

  const toggleUserSuspended = useCallback((id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, suspended: !u.suspended } : u)),
    );
  }, []);

  const verifyPending = useCallback((id: string, type: 'instructor' | 'institution') => {
    if (type === 'instructor') {
      updateMockInstructor(id, { verified: true });
      setUsers((prev) =>
        prev.map((u) => (u.instructorId === id ? { ...u, verified: true } : u)),
      );
    } else {
      updateMockInstitution(id, { verified: true });
      setUsers((prev) =>
        prev.map((u) => (u.institutionId === id ? { ...u, verified: true } : u)),
      );
      setInstitutions((prev) =>
        prev.map((g) => (g.id === id ? { ...g, verified: true } : g)),
      );
    }
    setPendingVerifications((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const rejectPending = useCallback((id: string) => {
    setPendingVerifications((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const verifyInstitution = useCallback((id: string) => {
    updateMockInstitution(id, { verified: true });
    setUsers((prev) =>
      prev.map((u) => (u.institutionId === id ? { ...u, verified: true } : u)),
    );
    setInstitutions((prev) =>
      prev.map((g) => (g.id === id ? { ...g, verified: true } : g)),
    );
    setPendingVerifications((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const rejectInstitution = useCallback((id: string) => {
    updateMockInstitution(id, { verified: false });
    setInstitutions((prev) =>
      prev.map((g) => (g.id === id ? { ...g, verified: false } : g)),
    );
    setPendingVerifications((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const dismissReportedReview = useCallback((id: string) => {
    setReportedReviews((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const removeReportedReview = useCallback((id: string) => {
    const review = reportedReviews.find((r) => r.id === id);
    setReportedReviews((prev) => prev.filter((r) => r.id !== id));
    return review?.id;
  }, [reportedReviews]);

  const value = useMemo(
    () => ({
      users,
      institutions,
      pendingVerifications,
      reportedReviews,
      toggleUserVerified,
      toggleUserSuspended,
      verifyPending,
      rejectPending,
      verifyInstitution,
      rejectInstitution,
      dismissReportedReview,
      removeReportedReview,
    }),
    [
      users,
      institutions,
      pendingVerifications,
      reportedReviews,
      toggleUserVerified,
      toggleUserSuspended,
      verifyPending,
      rejectPending,
      verifyInstitution,
      rejectInstitution,
      dismissReportedReview,
      removeReportedReview,
    ],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
