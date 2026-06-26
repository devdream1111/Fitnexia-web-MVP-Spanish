import type { Institution, InstitutionLocation } from '@/types/api';
import { resolveMediaUrl } from '@/utils/media';
import { normalizeOpeningHours } from '@/utils/opening-hours';

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

function readLocation(raw: Record<string, unknown>): InstitutionLocation | undefined {
  const nested = raw.location;
  const fromNested =
    nested && typeof nested === 'object'
      ? (nested as InstitutionLocation)
      : undefined;

  const address = pickString(fromNested?.address, raw.address);
  const city = pickString(fromNested?.city, raw.city);
  const country = pickString(fromNested?.country, raw.country);

  if (!address && !city && !country) return undefined;
  return {
    address: address ?? '',
    city: city ?? '',
    country: country ?? '',
    lat: fromNested?.lat ?? 0,
    lng: fromNested?.lng ?? 0,
  };
}

/** Normalize public institution payloads from API shape variations. */
export function normalizePublicInstitution(raw: Institution): Institution {
  const record = raw as Institution & Record<string, unknown>;
  const gallery = (raw.gallery ?? [])
    .map((url) => resolveMediaUrl(url) ?? url)
    .filter(Boolean);

  return {
    ...raw,
    name: pickString(raw.name, record.displayName, record.institutionName) ?? raw.name,
    description: pickString(raw.description, record.bio, record.about),
    logoUrl: resolveMediaUrl(pickString(raw.logoUrl, record.logo_url, record.photoUrl)) ?? undefined,
    contactPhone: pickString(raw.contactPhone, record.contact_phone, record.phone),
    contactEmail: pickString(raw.contactEmail, record.contact_email, record.email),
    website: pickString(raw.website, record.website_url, record.websiteUrl),
    location: readLocation(record) ?? raw.location,
    openingHours: normalizeOpeningHours(raw.openingHours ?? record.opening_hours),
    gallery,
    instructors: raw.instructors ?? [],
  };
}
