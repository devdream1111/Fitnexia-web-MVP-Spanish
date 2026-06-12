import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import {
  GOOGLE_OAUTH_TOKENS_COOKIE,
  clearOAuthState,
  getGoogleClientConfig,
  getGoogleRedirectUri,
  readOAuthState,
  type GoogleOAuthState,
} from '@/lib/google-oauth-server';

function redirectWithError(state: GoogleOAuthState | null, message: string): NextResponse {
  const origin = state?.returnOrigin ?? process.env.NEXT_PUBLIC_APP_URL ?? 'https://svganchordev.net/fitnexia-api/v1';
  const path = state?.mode === 'register' ? '/auth/register' : '/auth/login';
  return NextResponse.redirect(`${origin}${path}?googleError=${encodeURIComponent(message)}`);
}

export async function GET(request: NextRequest) {
  const stored = await readOAuthState();
  const code = request.nextUrl.searchParams.get('code');
  const returnedState = request.nextUrl.searchParams.get('state');
  const googleError = request.nextUrl.searchParams.get('error');

  if (googleError) {
    await clearOAuthState();
    return redirectWithError(stored, 'Inicio de sesión con Google cancelado.');
  }

  if (!stored || !code || returnedState !== stored.state) {
    await clearOAuthState();
    return redirectWithError(stored, 'La sesión de Google expiró. Inténtalo de nuevo.');
  }

  const origin = stored.returnOrigin;
  const redirectUri = getGoogleRedirectUri(origin);
  const { clientId, clientSecret } = getGoogleClientConfig();

  if (!clientId || !clientSecret) {
    await clearOAuthState();
    return redirectWithError(stored, 'Google Sign-In no está configurado en el servidor.');
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = (await tokenRes.json()) as {
      id_token?: string;
      error?: string;
      error_description?: string;
    };

    if (!tokenRes.ok || !tokenData.id_token) {
      await clearOAuthState();
      return redirectWithError(
        stored,
        tokenData.error_description ?? 'No se pudo obtener el token de Google.',
      );
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1';
    const body: Record<string, string> = { idToken: tokenData.id_token };
    if (stored.mode === 'register' && stored.role) {
      body.role = stored.role;
      if (stored.institutionName) body.institutionName = stored.institutionName;
    }

    const authRes = await fetch(`${apiBase}/auth/oauth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const authData = (await authRes.json()) as {
      accessToken?: string;
      refreshToken?: string;
      user?: { role: string };
      error?: { code?: string; message?: string };
    };

    await clearOAuthState();

    if (!authRes.ok || !authData.accessToken || !authData.refreshToken) {
      const message =
        authData.error?.code === 'NEEDS_ROLE'
          ? 'No hay cuenta con este correo. Crea una cuenta y elige tu perfil primero.'
          : (authData.error?.message ?? 'No se pudo autenticar con Google.');
      return redirectWithError(stored, message);
    }

    const jar = await cookies();
    jar.set(
      GOOGLE_OAUTH_TOKENS_COOKIE,
      JSON.stringify({
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
        role: authData.user?.role ?? 'athlete',
      }),
      {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60,
        path: '/',
      },
    );

    return NextResponse.redirect(`${origin}/auth/google/complete`);
  } catch {
    await clearOAuthState();
    return redirectWithError(stored, 'Error inesperado al iniciar sesión con Google.');
  }
}
