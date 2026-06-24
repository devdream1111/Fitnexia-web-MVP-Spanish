/** Institution profile id from the authenticated user session */
export function getLinkedInstitutionId(
  user: { institutionId?: string } | null | undefined,
): string {
  return user?.institutionId ?? '';
}
