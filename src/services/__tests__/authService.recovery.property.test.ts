/**
 * Feature: librohub-app
 * Propiedad 3: Round-trip de recuperación de contraseña
 *
 * Para todo correo registrado, el flujo:
 *   solicitar código → validar código → cambiar contraseña → login con la nueva contraseña
 * SHALL resultar en autenticación exitosa.
 *
 * Validates: Requirements 4.2, 4.5, 4.9, 4.10
 */

import fc from 'fast-check';
import { authService } from '../authService';
import { AuthResponse } from '../../types/auth';

fc.configureGlobal({ numRuns: 100 });

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue(null),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

/**
 * Arbitrary for a registered email address.
 */
const registeredEmailArb = fc
  .tuple(
    fc.string({ minLength: 3, maxLength: 20 }).filter((s) => /^[a-z0-9]+$/i.test(s)),
    fc.string({ minLength: 2, maxLength: 10 }).filter((s) => /^[a-z]+$/i.test(s)),
  )
  .map(([user, domain]) => `${user}@${domain}.com`);

/**
 * Arbitrary for a 6-digit verification code.
 */
const verificationCodeArb = fc
  .integer({ min: 100000, max: 999999 })
  .map((n) => String(n));

/**
 * Arbitrary for a new password (min 6 chars).
 */
const newPasswordArb = fc
  .string({ minLength: 6, maxLength: 30 })
  .filter((s) => s.trim().length >= 6);

function buildAuthResponse(email: string): AuthResponse {
  return {
    token: `token-${email}-${Date.now()}`,
    role: 'reader',
    userId: `user-${email}`,
  };
}

describe('Propiedad 3: Round-trip de recuperación de contraseña', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('flujo completo: enviar código → validar → cambiar contraseña → login resulta en autenticación exitosa', async () => {
    await fc.assert(
      fc.asyncProperty(
        registeredEmailArb,
        verificationCodeArb,
        newPasswordArb,
        async (email, code, newPassword) => {
          // Step 1: sendResetCode — Req 4.2
          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => undefined,
          } as unknown as Response);
          await authService.sendResetCode(email);

          // Step 2: validateCode — Req 4.5
          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => undefined,
          } as unknown as Response);
          await authService.validateCode(email, code);

          // Step 3: resetPassword — Req 4.9
          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => undefined,
          } as unknown as Response);
          await authService.resetPassword(email, code, newPassword);

          // Step 4: login with new password — Req 4.10
          const expectedResponse = buildAuthResponse(email);
          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => expectedResponse,
          } as Response);

          const result = await authService.login({
            username: email,
            password: newPassword,
          });

          // Token must be non-empty
          expect(result.token).toBeTruthy();
          expect(result.token.length).toBeGreaterThan(0);

          // Role must be valid
          expect(['reader', 'admin']).toContain(result.role);

          // userId must be present
          expect(result.userId).toBeTruthy();
        },
      ),
    );
  });

  it('correo no registrado al solicitar código devuelve error AUTH_EMAIL_NOT_FOUND', async () => {
    await fc.assert(
      fc.asyncProperty(registeredEmailArb, async (email) => {
        // Req 4.3 — unregistered email
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: async () => ({
            code: 'AUTH_EMAIL_NOT_FOUND',
            message: 'Correo no registrado',
          }),
        } as Response);

        let thrownError: { code: string; message: string } | null = null;
        try {
          await authService.sendResetCode(email);
        } catch (err) {
          thrownError = err as { code: string; message: string };
        }

        expect(thrownError).not.toBeNull();
        expect(thrownError?.code).toBe('AUTH_EMAIL_NOT_FOUND');
      }),
    );
  });

  it('código incorrecto o expirado devuelve error AUTH_CODE_INVALID', async () => {
    await fc.assert(
      fc.asyncProperty(registeredEmailArb, verificationCodeArb, async (email, code) => {
        // Req 4.6 — invalid/expired code
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json: async () => ({
            code: 'AUTH_CODE_INVALID',
            message: 'Código de verificación incorrecto o expirado',
          }),
        } as Response);

        let thrownError: { code: string; message: string } | null = null;
        try {
          await authService.validateCode(email, code);
        } catch (err) {
          thrownError = err as { code: string; message: string };
        }

        expect(thrownError).not.toBeNull();
        expect(thrownError?.code).toBe('AUTH_CODE_INVALID');
      }),
    );
  });
});
