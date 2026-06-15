/** ISO 3166-1 alpha-2 codes supported in institution profiles */
export const COUNTRY_OPTIONS = [
  { value: 'ES', label: 'España' },
  { value: 'AR', label: 'Argentina' },
  { value: 'UY', label: 'Uruguay' },
  { value: 'MX', label: 'México' },
  { value: 'CL', label: 'Chile' },
  { value: 'CO', label: 'Colombia' },
  { value: 'PE', label: 'Perú' },
] as const;

export const DEFAULT_COUNTRY_CODE = 'ES';

export function normalizeCountryCode(value?: string | null): string | null {
  if (!value) return null;
  const code = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

export function resolveCountryCode(value?: string | null): string {
  return normalizeCountryCode(value) ?? DEFAULT_COUNTRY_CODE;
}

export function getCountryLabel(code?: string | null): string {
  const normalized = normalizeCountryCode(code);
  if (!normalized) return '';
  return COUNTRY_OPTIONS.find((c) => c.value === normalized)?.label ?? normalized;
}
