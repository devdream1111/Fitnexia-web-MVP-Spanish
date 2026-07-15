/**
 * Google Drive / APK download URL helpers.
 * Accepts share links (`/file/d/<id>/view`) or direct `uc?export=download` URLs.
 * Can resolve Drive's virus-scan interstitial and return a binary Response for proxying.
 */

const DRIVE_FILE_ID_RE =
  /(?:drive\.google\.com\/file\/d\/|drive\.google\.com\/open\?id=|[?&]id=)([a-zA-Z0-9_-]+)/;

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

export function extractGoogleDriveFileId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  const match = trimmed.match(DRIVE_FILE_ID_RE);
  return match?.[1] ?? null;
}

/** Convert a Drive share/view URL into a direct download URL when possible. */
export function toGoogleDriveDirectDownloadUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';

  if (
    (/drive\.google\.com\/uc\?/.test(trimmed) || /drive\.usercontent\.google\.com\/download/.test(trimmed)) &&
    /export=download/.test(trimmed)
  ) {
    return trimmed;
  }

  const fileId = extractGoogleDriveFileId(trimmed);
  if (fileId) {
    // usercontent endpoint is more reliable for browsers + confirm=t skips many interstitial pages
    return `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;
  }

  return trimmed;
}

function isBinaryApkResponse(response: Response): boolean {
  const type = (response.headers.get('content-type') ?? '').toLowerCase();
  if (!type || type.includes('application/octet-stream')) return true;
  if (type.includes('application/vnd.android.package-archive')) return true;
  if (type.includes('application/zip')) return true;
  if (type.includes('application/java-archive')) return true;
  if (type.includes('text/html') || type.includes('text/plain') || type.includes('application/json')) {
    return false;
  }
  // Unknown but successful — treat as binary if not HTML
  return response.ok && !type.startsWith('text/');
}

function collectSetCookieHeader(response: Response): string {
  const headers = response.headers as Headers & { getSetCookie?: () => string[] };
  if (typeof headers.getSetCookie === 'function') {
    return headers
      .getSetCookie()
      .map((cookie) => cookie.split(';')[0]?.trim())
      .filter(Boolean)
      .join('; ');
  }
  const single = response.headers.get('set-cookie');
  return single ? single.split(';')[0]!.trim() : '';
}

function parseDriveConfirmParams(html: string): { confirm?: string; uuid?: string } {
  const confirm =
    html.match(/confirm=([0-9A-Za-z_-]+)/)?.[1] ??
    html.match(/name="confirm"\s+value="([^"]+)"/)?.[1] ??
    html.match(/&amp;confirm=([0-9A-Za-z_-]+)/)?.[1];
  const uuid = html.match(/name="uuid"\s+value="([^"]+)"/)?.[1];
  return { confirm: confirm || 't', uuid };
}

/**
 * Fetches the APK bytes from Drive/CDN, handling Google Drive confirmation HTML when needed.
 */
export async function fetchAndroidApkUpstream(sourceUrl: string): Promise<Response> {
  const direct = toGoogleDriveDirectDownloadUrl(sourceUrl);
  if (!direct) {
    return new Response(JSON.stringify({ error: 'APK URL is empty' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const fileId = extractGoogleDriveFileId(sourceUrl) ?? extractGoogleDriveFileId(direct);

  async function get(url: string, cookie = ''): Promise<Response> {
    return fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': BROWSER_UA,
        Accept: '*/*',
        ...(cookie ? { Cookie: cookie } : {}),
      },
      cache: 'no-store',
    });
  }

  let response = await get(direct);
  let cookie = collectSetCookieHeader(response);

  if (isBinaryApkResponse(response) && response.body) {
    return response;
  }

  const html = await response.text();
  if (!fileId) {
    return new Response(
      JSON.stringify({ error: 'Upstream did not return an APK and no Drive file id was found.' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const { confirm, uuid } = parseDriveConfirmParams(html);
  const confirmParams = new URLSearchParams({
    id: fileId,
    export: 'download',
    confirm: confirm || 't',
  });
  if (uuid) confirmParams.set('uuid', uuid);

  const confirmedUrls = [
    `https://drive.usercontent.google.com/download?${confirmParams.toString()}`,
    `https://drive.google.com/uc?${confirmParams.toString()}`,
  ];

  for (const url of confirmedUrls) {
    response = await get(url, cookie);
    cookie = collectSetCookieHeader(response) || cookie;
    if (isBinaryApkResponse(response) && response.body) {
      return response;
    }
    // drain non-binary body before next attempt
    await response.arrayBuffer().catch(() => undefined);
  }

  return new Response(
    JSON.stringify({
      error: 'Could not download APK from Google Drive (virus-scan page or link permissions).',
    }),
    { status: 502, headers: { 'Content-Type': 'application/json' } },
  );
}
