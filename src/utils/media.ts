import { apiUploadMedia } from '@/services/api';

const HTTP_URL_REGEX = /^https?:\/\//i;

export function isHttpUrl(value: string): boolean {
  return HTTP_URL_REGEX.test(value);
}

async function blobToFile(blob: Blob, filename: string): Promise<File> {
  return new File([blob], filename, { type: blob.type || 'image/jpeg' });
}

async function dataUrlToFile(dataUrl: string): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const ext = blob.type.split('/')[1] ?? 'jpg';
  return blobToFile(blob, `photo.${ext}`);
}

export async function resolveUploadableImageUrl(
  value: string | null | undefined,
): Promise<string | undefined> {
  if (!value) return undefined;
  if (isHttpUrl(value)) return value;

  let file: File;
  if (value.startsWith('data:')) {
    file = await dataUrlToFile(value);
  } else if (value.startsWith('blob:')) {
    const response = await fetch(value);
    file = await blobToFile(await response.blob(), 'photo.jpg');
  } else {
    return undefined;
  }

  const { publicUrl } = await apiUploadMedia(file);
  return publicUrl;
}

export async function resolveUploadableImageUrls(urls: string[]): Promise<string[]> {
  const resolved = await Promise.all(urls.map((url) => resolveUploadableImageUrl(url)));
  return resolved.filter((url): url is string => Boolean(url));
}
