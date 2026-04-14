import { UserRole } from '../types/auth';

/**
 * Pure function that maps a role (or null) to the navigator key.
 * Extracted for testability — Propiedad 11.
 * Requisitos: 12.1, 12.2, 12.3, 12.4
 */
export function resolveNavigator(role: UserRole | null): 'auth' | 'reader' | 'admin' {
  if (role === 'reader') return 'reader';
  if (role === 'admin') return 'admin';
  return 'auth';
}
