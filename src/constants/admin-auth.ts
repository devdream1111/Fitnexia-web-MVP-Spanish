/** Static admin portal credentials (client-validated). */
export const ADMIN_STATIC_EMAIL = 'info@fitnexia.fit';
export const ADMIN_STATIC_PASSWORD = 'fitnexia123789';

export function isValidAdminCredentials(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === ADMIN_STATIC_EMAIL.toLowerCase() &&
    password === ADMIN_STATIC_PASSWORD
  );
}
