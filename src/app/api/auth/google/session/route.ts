import { NextResponse } from 'next/server';

import { clearOAuthTokens, readOAuthTokens } from '@/lib/google-oauth-server';

export async function GET() {
  const tokens = await readOAuthTokens();
  await clearOAuthTokens();

  if (!tokens) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  }

  return NextResponse.json(tokens);
}
