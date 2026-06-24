import { apiUploadMedia } from '@/services/api';
import { API_BASE_URL } from '@/types/api';

const HTTP_URL_REGEX = /^https?:\/\//i;
const ALLOWED_UPLOAD_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export type ImageUploadInput = string | File | null | undefined;

export function isHttpUrl(value: string): boolean {
  return HTTP_URL_REGEX.test(value);
}

function getApiPathPrefix(): string | null {
  try {
    const apiUrl = new URL(API_BASE_URL);
    const prefix = apiUrl.pathname.replace(/\/v1\/?$/, '');
    return prefix && prefix !== '/' ? prefix : null;
  } catch {
    return null;
  }
}

/** Heal API media URLs that omit the nginx path prefix (e.g. /fitnexia-api). */
function healAbsoluteMediaUrl(url: string): string {
  const prefix = getApiPathPrefix();
  if (!prefix) return url;

  try {
    const valueUrl = new URL(url);
    const apiUrl = new URL(API_BASE_URL);
    if (valueUrl.origin !== apiUrl.origin) return url;
    if (!valueUrl.pathname.startsWith('/v1/')) return url;
    if (valueUrl.pathname.startsWith(`${prefix}/`)) return url;
    return `${valueUrl.origin}${prefix}${valueUrl.pathname}${valueUrl.search}`;
  } catch {
    return url;
  }
}

/** Turn API-relative media paths into absolute URLs for <img src>. */
export function resolveMediaUrl(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return undefined;

  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed;

  if (isHttpUrl(trimmed)) {
    return healAbsoluteMediaUrl(trimmed);
  }

  if (trimmed.startsWith('//')) return `https:${trimmed}`;

  try {
    const apiUrl = new URL(API_BASE_URL);
    const prefix = apiUrl.pathname.replace(/\/v1\/?$/, '') || '';

    if (trimmed.startsWith('/')) {
      if (trimmed.startsWith('/v1/') && prefix) {
        return `${apiUrl.origin}${prefix}${trimmed}`;
      }
      return `${apiUrl.origin}${trimmed}`;
    }

    return new URL(trimmed, `${apiUrl.origin}${prefix}/`).href;
  } catch {
    return trimmed;
  }
}

export function resolveAvatarDisplayUrl(value: ImageUploadInput): string | undefined {
  if (!value) return undefined;
  if (value instanceof File) return undefined;
  return resolveMediaUrl(value);
}

export function isPendingImageUpload(value: ImageUploadInput): value is File | string {
  if (!value) return false;
  if (value instanceof File) return true;
  return value.startsWith('data:') || value.startsWith('blob:');
}

/** Convert unsupported browser formats (e.g. HEIC) to JPEG for backend upload. */
export async function normalizeImageFile(file: File): Promise<File> {
  if (ALLOWED_UPLOAD_TYPES.has(file.type)) {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('Formato no compatible. Usá JPEG, PNG, WebP o GIF.');
  }

  try {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('No se pudo procesar la imagen.');
    }
    ctx.drawImage(bitmap, 0, 0);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error('No se pudo convertir la imagen.'))),
        'image/jpeg',
        0.92,
      );
    });

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
  } finally {
    bitmap.close();
  }
}

async function blobToFile(blob: Blob, filename: string): Promise<File> {
  return new File([blob], filename, { type: blob.type || 'image/jpeg' });
}

async function dataUrlToFile(dataUrl: string): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const ext = blob.type.split('/')[1] ?? 'jpg';
  return normalizeImageFile(await blobToFile(blob, `photo.${ext}`));
}

async function valueToUploadFile(value: string | File): Promise<File> {
  if (value instanceof File) {
    return normalizeImageFile(value);
  }
  if (value.startsWith('data:')) {
    return dataUrlToFile(value);
  }
  if (value.startsWith('blob:')) {
    const response = await fetch(value);
    return normalizeImageFile(await blobToFile(await response.blob(), 'photo.jpg'));
  }
  throw new Error('Seleccioná una imagen válida.');
}

export async function resolveUploadableImageUrl(
  value: ImageUploadInput,
): Promise<string | undefined> {
  if (!value) return undefined;
  if (typeof value === 'string' && isHttpUrl(value)) {
    return healAbsoluteMediaUrl(value);
  }

  const file = await valueToUploadFile(value instanceof File ? value : value);
  const { publicUrl } = await apiUploadMedia(file);
  return resolveMediaUrl(publicUrl) ?? publicUrl;
}

export async function resolveUploadableImageUrls(urls: string[]): Promise<string[]> {
  const resolved = await Promise.all(urls.map((url) => resolveUploadableImageUrl(url)));
  return resolved.filter((url): url is string => Boolean(url));
}
