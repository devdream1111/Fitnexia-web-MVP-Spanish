import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import {
  GOOGLE_OAUTH_STATE_COOKIE,
  getAppOrigin,
  getGoogleClientConfig,
  getGoogleRedirectUri,
  parseOAuthRole,
} from '@/lib/google-oauth-server';

export async function GET(request: NextRequest) {
  const { clientId, clientSecret } = getGoogleClientConfig();
  const origin = getAppOrigin(request);
  const redirectUri = getGoogleRedirectUri(origin);

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${origin}/auth/login?googleError=${encodeURIComponent('Google Sign-In no está configurado (revisa GOOGLE_CLIENT_SECRET en .env.local).')}`,
    );
  }

  const mode = request.nextUrl.searchParams.get('mode') === 'register' ? 'register' : 'login';
  const role = parseOAuthRole(request.nextUrl.searchParams.get('role'));
  const institutionName = request.nextUrl.searchParams.get('institutionName')?.trim() || undefined;

  if (mode === 'register' && !role) {
    return NextResponse.redirect(
      `${origin}/auth/register?googleError=${encodeURIComponent('Elige un tipo de perfil antes de registrarte con Google.')}`,
    );
  }

  const state = randomUUID();
  const jar = await cookies();
  jar.set(
    GOOGLE_OAUTH_STATE_COOKIE,
    JSON.stringify({ state, mode, role, institutionName, returnOrigin: origin }),
    {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600,
      path: '/',
    },
  );

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
