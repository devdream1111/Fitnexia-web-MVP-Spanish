import { NextResponse } from 'next/server';

import { ANDROID_APK_FILENAME, ANDROID_APK_URL } from '@/constants/mobile-app';
import {
  fetchAndroidApkUpstream,
  toGoogleDriveDirectDownloadUrl,
} from '@/utils/google-drive-download';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function attachmentHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  headers.set('Content-Type', 'application/vnd.android.package-archive');
  headers.set(
    'Content-Disposition',
    `attachment; filename="${ANDROID_APK_FILENAME}"; filename*=UTF-8''${encodeURIComponent(ANDROID_APK_FILENAME)}`,
  );
  headers.set('Cache-Control', 'private, max-age=300');
  headers.set('X-Content-Type-Options', 'nosniff');
  return headers;
}

/**
 * Same-origin APK download endpoint.
 * 1) Tries to proxy the file (true attachment on this host).
 * 2) Falls back to a 302 to Drive’s direct download URL if the server
 *    cannot stream upstream (common with large Drive files / TLS resets).
 */
export async function GET() {
  if (!ANDROID_APK_URL) {
    return NextResponse.json(
      { error: 'Android APK URL is not configured (NEXT_PUBLIC_ANDROID_APK_URL).' },
      { status: 404 },
    );
  }

  const direct = toGoogleDriveDirectDownloadUrl(ANDROID_APK_URL);

  try {
    const upstream = await fetchAndroidApkUpstream(ANDROID_APK_URL);
    if (upstream.ok && upstream.body) {
      const headers = attachmentHeaders();
      const length = upstream.headers.get('content-length');
      if (length) headers.set('Content-Length', length);

      return new NextResponse(upstream.body, {
        status: 200,
        headers,
      });
    }
  } catch {
    /* fall through to redirect */
  }

  if (!direct) {
    return NextResponse.json(
      { error: 'Could not resolve Android APK download URL.' },
      { status: 502 },
    );
  }

  // Browser completes the download from Drive; SPA never showed the preview page.
  const response = NextResponse.redirect(direct, 302);
  response.headers.set(
    'Content-Disposition',
    `attachment; filename="${ANDROID_APK_FILENAME}"`,
  );
  return response;
}
