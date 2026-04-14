/**
 * Feature: librohub-app
 * Propiedad 11: Control de acceso por rol
 *
 * Validates: Requirements 12.2, 12.3, 12.4
 */

import fc from 'fast-check';
import { resolveNavigator } from '../resolveNavigator';
import type { UserRole } from '../../types/auth';

// Configure minimum 100 iterations
fc.configureGlobal({ numRuns: 100 });

// Arbitraries
const readerRoleArb = fc.constant<UserRole>('reader');
const adminRoleArb = fc.constant<UserRole>('admin');
const nullRoleArb = fc.constant<UserRole | null>(null);

// Reader routes (only accessible to readers)
const readerRoutes = ['Home', 'Profile', 'BookDetail', 'ChangePassword', 'ReaderTabs'];
// Admin routes (only accessible to admins)
const adminRoutes = ['AdminHome', 'Users', 'Books', 'AdminProfile', 'UserForm', 'BookForm', 'AdminTabs'];
// Auth routes (only accessible when unauthenticated)
const authRoutes = ['Login', 'Register', 'ForgotPassword', 'ValidateCode', 'NewPassword'];

describe('Propiedad 11: Control de acceso por rol', () => {
  /**
   * Validates: Requirements 12.3
   * Para todo token válido con rol 'reader', el navigator SHALL resolver
   * únicamente rutas del Lector y rechazar rutas del Administrador.
   */
  it('rol reader → resuelve navigator reader y rechaza rutas de admin', () => {
    fc.assert(
      fc.property(readerRoleArb, (role) => {
        const navigator = resolveNavigator(role);

        // Must resolve to reader navigator
        expect(navigator).toBe('reader');

        // Reader navigator must NOT be admin or auth
        expect(navigator).not.toBe('admin');
        expect(navigator).not.toBe('auth');
      }),
    );
  });

  /**
   * Validates: Requirements 12.4
   * Para todo token válido con rol 'admin', el navigator SHALL resolver
   * únicamente rutas del Administrador y rechazar rutas del Lector.
   */
  it('rol admin → resuelve navigator admin y rechaza rutas de lector', () => {
    fc.assert(
      fc.property(adminRoleArb, (role) => {
        const navigator = resolveNavigator(role);

        // Must resolve to admin navigator
        expect(navigator).toBe('admin');

        // Admin navigator must NOT be reader or auth
        expect(navigator).not.toBe('reader');
        expect(navigator).not.toBe('auth');
      }),
    );
  });

  /**
   * Validates: Requirements 12.2
   * WHEN un usuario no autenticado intenta acceder a una ruta protegida,
   * THE Navigator SHALL redirigirlo a la pantalla de Login.
   */
  it('sin token (null) → resuelve navigator auth', () => {
    fc.assert(
      fc.property(nullRoleArb, (role) => {
        const navigator = resolveNavigator(role);

        // Must resolve to auth navigator
        expect(navigator).toBe('auth');

        // Auth navigator must NOT be reader or admin
        expect(navigator).not.toBe('reader');
        expect(navigator).not.toBe('admin');
      }),
    );
  });

  /**
   * Validates: Requirements 12.2, 12.3, 12.4
   * Propiedad combinada: para cualquier rol válido o null,
   * resolveNavigator produce exactamente uno de los tres valores posibles
   * y la asignación es determinista (misma entrada → misma salida).
   */
  it('resolveNavigator es determinista y exhaustivo para todos los roles', () => {
    const allRoles = fc.oneof(readerRoleArb, adminRoleArb, nullRoleArb);

    fc.assert(
      fc.property(allRoles, (role) => {
        const result1 = resolveNavigator(role);
        const result2 = resolveNavigator(role);

        // Deterministic: same input → same output
        expect(result1).toBe(result2);

        // Exhaustive: result must be one of the three valid values
        expect(['auth', 'reader', 'admin']).toContain(result1);

        // Role-to-navigator mapping is exclusive
        if (role === 'reader') {
          expect(result1).toBe('reader');
        } else if (role === 'admin') {
          expect(result1).toBe('admin');
        } else {
          expect(result1).toBe('auth');
        }
      }),
    );
  });

  /**
   * Validates: Requirements 12.3, 12.4
   * Propiedad de separación: reader y admin nunca resuelven al mismo navigator.
   */
  it('reader y admin resuelven a navigators distintos', () => {
    fc.assert(
      fc.property(readerRoleArb, adminRoleArb, (readerRole, adminRole) => {
        const readerNav = resolveNavigator(readerRole);
        const adminNav = resolveNavigator(adminRole);

        expect(readerNav).not.toBe(adminNav);
        expect(readerNav).toBe('reader');
        expect(adminNav).toBe('admin');
      }),
    );
  });
});
