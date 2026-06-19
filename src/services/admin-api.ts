import { apiRequest } from '@/services/api-client';
import type { PaginatedResponse } from '@/types/api';

export interface AdminApiUser {
  id: string;
  email: string;
  role: string;
  createdAt?: string;
}

export interface AdminVerificationRequest {
  id: string;
  subjectType: 'instructor' | 'institution';
  instructorId?: string;
  institutionId?: string;
  subjectName?: string;
  status: string;
  submittedAt: string;
}

export interface AdminMetricsOverview {
  users: number;
  classes: number;
  bookings?: number;
  confirmedBookings?: number;
  instructors: number;
  institutions: number;
}

export function apiAdminListUsers(params: { page?: number; limit?: number } = {}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const query = qs.toString();
  return apiRequest<PaginatedResponse<AdminApiUser>>(
    `/admin/users${query ? `?${query}` : ''}`,
  );
}

export function apiAdminGetUser(id: string) {
  return apiRequest<AdminApiUser>(`/admin/users/${id}`);
}

export function apiAdminListVerificationRequests() {
  return apiRequest<{ data: AdminVerificationRequest[] }>('/admin/verification-requests');
}

export function apiAdminApproveVerification(id: string) {
  return apiRequest<{ id: string; status: string }>(
    `/admin/verification-requests/${id}/approve`,
    { method: 'POST' },
  );
}

export function apiAdminRejectVerification(id: string, notes?: string) {
  return apiRequest<{ id: string; status: string }>(
    `/admin/verification-requests/${id}/reject`,
    {
      method: 'POST',
      body: JSON.stringify({ notes }),
    },
  );
}

export function apiAdminMetricsOverview() {
  return apiRequest<AdminMetricsOverview>('/admin/metrics/overview');
}
