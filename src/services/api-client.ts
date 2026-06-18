import { API_BASE_URL, type ApiError, type AuthResponse } from '@/types/api';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'fitnexia_access_token',
  REFRESH_TOKEN: 'fitnexia_refresh_token',
} as const;

export class ApiClientError extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as AuthResponse;
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export type ApiRequestOptions = RequestInit & {
  auth?: boolean;
};

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { auth = true, ...init } = options;

  const headers: Record<string, string> = {
    ...((init.headers as Record<string, string>) ?? {}),
  };

  if (init.body && !(init.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${path}`;

  let res = await fetch(url, { ...init, headers });

  if (res.status === 401 && auth) {
    if (!refreshPromise) refreshPromise = tryRefresh();
    const refreshed = await refreshPromise;
    refreshPromise = null;

    if (refreshed) {
      const token = getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
      res = await fetch(url, { ...init, headers });
    }
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  const data = parseResponseJson(text);

  if (!res.ok) {
    const err = data as ApiError | null;
    throw new ApiClientError(
      res.status,
      err?.error?.code ?? 'UNKNOWN',
      err?.error?.message ?? (text.trim() || res.statusText),
      err?.error?.details,
    );
  }

  return data as T;
}

function parseResponseJson(text: string): unknown | null {
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function parseApiErrorMessage(text: string, fallback: string): string {
  if (!text.trim()) return fallback;
  try {
    const parsed = JSON.parse(text) as ApiError;
    return parsed.error?.message ?? fallback;
  } catch {
    return fallback;
  }
}

/** Authenticated binary download (CSV, etc.) without JSON parsing. */
export async function apiFetchAuthenticatedBlob(path: string): Promise<Blob> {
  const headers: Record<string, string> = {};
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = `${API_BASE_URL}${path}`;
  let res = await fetch(url, { headers });

  if (res.status === 401) {
    if (!refreshPromise) refreshPromise = tryRefresh();
    const refreshed = await refreshPromise;
    refreshPromise = null;

    if (refreshed) {
      const nextToken = getAccessToken();
      if (nextToken) headers.Authorization = `Bearer ${nextToken}`;
      res = await fetch(url, { headers });
    }
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(parseApiErrorMessage(text, 'No se pudo exportar'));
  }

  return res.blob();
}
