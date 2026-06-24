import { DEFAULT_MAP_CENTER } from '@/constants/fitnexia';
import type { Modality } from '@/types/api';

export function labelFromClassLocation(location?: { label?: string } | null): string {
  return location?.label?.trim() ?? '';
}

export function defaultLocationLabelFromInstitution(profile?: {
  name?: string;
  address?: string;
  city?: string;
}): string {
  const addressLine = [profile?.address?.trim(), profile?.city?.trim()].filter(Boolean).join(', ');
  return addressLine || profile?.name?.trim() || '';
}

export function buildLocationPayload(
  modality: Modality,
  label: string,
  existing?: { lat: number; lng: number; label: string } | null,
): { lat: number; lng: number; label: string } | undefined {
  if (modality !== 'in_person') return undefined;
  const trimmed = label.trim();
  if (!trimmed) return undefined;
  return {
    label: trimmed,
    lat: existing?.lat ?? DEFAULT_MAP_CENTER.lat,
    lng: existing?.lng ?? DEFAULT_MAP_CENTER.lng,
  };
}
