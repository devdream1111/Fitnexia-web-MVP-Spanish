import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export const GOOGLE_OAUTH_STATE_COOKIE = 'fn_google_oauth_state';
export const GOOGLE_OAUTH_TOKENS_COOKIE = 'fn_google_oauth_tokens';

const VALID_ROLES = new Set(['athlete', 'instructor', 'institution']);

export interface GoogleOAuthState {
  state: string;
  mode: 'login' | 'register';
  role?: string;
  institutionName?: string;
  returnOrigin: string;
}

export interface GoogleOAuthTokens {
  accessToken: string;
  refreshToken: string;
  role: string;
}

export function getAppOrigin(request: NextRequest): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
}

export function getGoogleClientConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID ?? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? '';
  return { clientId, clientSecret };
}

export function getGoogleRedirectUri(origin: string): string {
  return `${origin}/api/auth/google/callback`;
}

export function parseOAuthRole(value: string | null): string | undefined {
  if (!value || !VALID_ROLES.has(value)) return undefined;
  return value;
}

export async function readOAuthState(): Promise<GoogleOAuthState | null> {
  const jar = await cookies();
  const raw = jar.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GoogleOAuthState;
  } catch {
    return null;
  }
}

export async function clearOAuthState(): Promise<void> {
  const jar = await cookies();
  jar.delete(GOOGLE_OAUTH_STATE_COOKIE);
}

export async function readOAuthTokens(): Promise<GoogleOAuthTokens | null> {
  const jar = await cookies();
  const raw = jar.get(GOOGLE_OAUTH_TOKENS_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GoogleOAuthTokens;
  } catch {
    return null;
  }
}

export async function clearOAuthTokens(): Promise<void> {
  const jar = await cookies();
  jar.delete(GOOGLE_OAUTH_TOKENS_COOKIE);
}
