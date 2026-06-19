'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  MOCK_INSTITUTIONS,
  MOCK_PENDING_VERIFICATIONS,
  MOCK_REPORTED_REVIEWS,
  MOCK_USERS,
  updateMockInstructor,
  updateMockInstitution,
} from '@/data/mock';
import {
  apiAdminApproveVerification,
  apiAdminListUsers,
  apiAdminListVerificationRequests,
  apiAdminMetricsOverview,
  apiAdminRejectVerification,
  type AdminMetricsOverview,
} from '@/services/admin-api';
import { getAccessToken } from '@/services/api-client';
import type {
  AdminUser,
  Institution,
  PendingVerification,
  ReportedReview,
} from '@/types/api';

interface AdminContextValue {
  users: AdminUser[];
  institutions: Institution[];
  pendingVerifications: PendingVerification[];
  reportedReviews: ReportedReview[];
  metrics: AdminMetricsOverview | null;
  loading: boolean;
  apiConnected: boolean;
  refresh: () => Promise<void>;
  toggleUserVerified: (id: string) => void;
  toggleUserSuspended: (id: string) => void;
  verifyPending: (id: string, type: 'instructor' | 'institution') => Promise<void>;
  rejectPending: (id: string) => Promise<void>;
  verifyInstitution: (id: string) => void;
  rejectInstitution: (id: string) => void;
  dismissReportedReview: (id: string) => void;
  removeReportedReview: (id: string) => string | undefined;
}

const AdminContext = createContext<AdminContextValue | null>(null);

function mapApiUserToAdminUser(u: {
  id: string;
  email: string;
  role: string;
}): AdminUser {
  const local = u.email.split('@')[0] ?? 'User';
  const nameParts = local.replace(/[._-]+/g, ' ').split(/\s+/);
  return {
    id: u.id,
    email: u.email,
    role: u.role as AdminUser['role'],
    firstName: nameParts[0] ?? 'Usuario',
    lastName: nameParts.slice(1).join(' ') || '—',
    verified: u.role === 'admin',
    suspended: false,
  };
}

function mapVerificationRequest(v: {
  id: string;
  subjectType: string;
  instructorId?: string;
  institutionId?: string;
  subjectName?: string;
  submittedAt?: string;
}): PendingVerification {
  const isInstructor = v.subjectType === 'instructor';
  return {
    id: v.id,
    type: isInstructor ? 'instructor' : 'institution',
    name: v.subjectName ?? 'Pendiente',
    submittedAt: v.submittedAt ?? new Date().toISOString(),
    reason: isInstructor ? 'Solicitud de verificación de instructor' : 'Solicitud de verificación de institución',
  };
}

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
  const [metrics, setMetrics] = useState<AdminMetricsOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);

  const refresh = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setApiConnected(false);
      return;
    }

    setLoading(true);
    try {
      const [usersRes, verificationsRes, metricsRes] = await Promise.all([
        apiAdminListUsers({ limit: 50 }),
        apiAdminListVerificationRequests(),
        apiAdminMetricsOverview(),
      ]);

      setUsers(usersRes.data.map(mapApiUserToAdminUser));
      setPendingVerifications(verificationsRes.data.map(mapVerificationRequest));
      setMetrics(metricsRes);
      setApiConnected(true);
    } catch {
      setApiConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleUserVerified = useCallback((id: string) => {
    if (apiConnected) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, verified: !u.verified } : u)),
    );
  }, [apiConnected]);

  const toggleUserSuspended = useCallback((id: string) => {
    if (apiConnected) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, suspended: !u.suspended } : u)),
    );
  }, [apiConnected]);

  const verifyPending = useCallback(
    async (id: string, type: 'instructor' | 'institution') => {
      if (apiConnected) {
        await apiAdminApproveVerification(id);
        await refresh();
        return;
      }

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
    },
    [apiConnected, refresh],
  );

  const rejectPending = useCallback(
    async (id: string) => {
      if (apiConnected) {
        await apiAdminRejectVerification(id);
        await refresh();
        return;
      }
      setPendingVerifications((prev) => prev.filter((v) => v.id !== id));
    },
    [apiConnected, refresh],
  );

  const verifyInstitution = useCallback((id: string) => {
    if (apiConnected) return;
    updateMockInstitution(id, { verified: true });
    setUsers((prev) =>
      prev.map((u) => (u.institutionId === id ? { ...u, verified: true } : u)),
    );
    setInstitutions((prev) =>
      prev.map((g) => (g.id === id ? { ...g, verified: true } : g)),
    );
  }, [apiConnected]);

  const rejectInstitution = useCallback((id: string) => {
    if (apiConnected) return;
    setInstitutions((prev) => prev.filter((g) => g.id !== id));
  }, [apiConnected]);

  const dismissReportedReview = useCallback((id: string) => {
    setReportedReviews((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const removeReportedReview = useCallback((id: string) => {
    let reviewId: string | undefined;
    setReportedReviews((prev) => {
      const item = prev.find((r) => r.id === id);
      reviewId = item?.id;
      return prev.filter((r) => r.id !== id);
    });
    return reviewId;
  }, []);

  const value = useMemo(
    () => ({
      users,
      institutions,
      pendingVerifications,
      reportedReviews,
      metrics,
      loading,
      apiConnected,
      refresh,
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
      metrics,
      loading,
      apiConnected,
      refresh,
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
