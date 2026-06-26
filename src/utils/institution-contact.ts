/** Account email and institution contact email are the same for gym/club operators. */
export function institutionContactEmail(
  accountEmail?: string | null,
  profileContactEmail?: string | null,
): string {
  return (accountEmail?.trim() || profileContactEmail?.trim() || '').trim();
}
