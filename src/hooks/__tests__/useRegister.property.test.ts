/**
 * Feature: librohub-app
 * Propiedad 2: Round-trip de registro → login
 *
 * Para todo conjunto de datos de registro con correo único y documento único,
 * el flujo registro → login con las mismas credenciales SHALL resultar en
 * autenticación exitosa y devolver un token válido con rol `reader`.
 *
 * Validates: Requirements 3.2, 3.6
 */

import fc from 'fast-check';
import { authService } from '../../services/authService';
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
 * Arbitrary for valid registration data.
 * Generates unique-looking emails and documents using a counter suffix.
 */
const registerDataArb = fc.record({
  name: fc.string({ minLength: 2, maxLength: 40 }).filter((s) => s.trim().length >= 2),
  document: fc
    .integer({ min: 10000000, max: 99999999 })
    .map((n) => String(n)),
  email: fc
    .tuple(
      fc.string({ minLength: 3, maxLength: 20 }).filter((s) => /^[a-z0-9]+$/i.test(s)),
      fc.string({ minLength: 2, maxLength: 10 }).filter((s) => /^[a-z]+$/i.test(s)),
    )
    .map(([user, domain]) => `${user}@${domain}.com`),
  phone: fc
    .integer({ min: 3000000000, max: 3999999999 })
    .map((n) => String(n)),
  password: fc
    .string({ minLength: 6, maxLength: 30 })
    .filter((s) => s.trim().length >= 6),
});

/**
 * Build a mock AuthResponse for a registration (role is always 'reader').
 */
function buildReaderAuthResponse(email: string): AuthResponse {
  return {
    token: `token-${email}-${Date.now()}`,
    role: 'reader',
    userId: `user-${email}`,
  };
}

describe('Propiedad 2: Round-trip de registro → login', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('registro exitoso seguido de login con las mismas credenciales devuelve token con rol reader', async () => {
    await fc.assert(
      fc.asyncProperty(registerDataArb, async (data) => {
        // Step 1: register — server returns 201 / no body
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => undefined,
        } as unknown as Response);

        await authService.register(data);

        // Step 2: login with same email as username and same password
        const expectedResponse = buildReaderAuthResponse(data.email);
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => expectedResponse,
        } as Response);

        const result = await authService.login({
          username: data.email,
          password: data.password,
        });

        // Token must be non-empty
        expect(result.token).toBeTruthy();
        expect(result.token.length).toBeGreaterThan(0);

        // Role must be 'reader' after registration
        expect(result.role).toBe('reader');

        // userId must be present
        expect(result.userId).toBeTruthy();
      }),
    );
  });

  it('registro con correo duplicado devuelve error USER_DUPLICATE_EMAIL', async () => {
    await fc.assert(
      fc.asyncProperty(registerDataArb, async (data) => {
        // Server rejects with duplicate email error
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 409,
          statusText: 'Conflict',
          json: async () => ({
            code: 'USER_DUPLICATE_EMAIL',
            message: 'El correo ya está registrado',
          }),
        } as Response);

        let thrownError: { code: string; message: string } | null = null;
        try {
          await authService.register(data);
        } catch (err) {
          thrownError = err as { code: string; message: string };
        }

        expect(thrownError).not.toBeNull();
        expect(thrownError?.code).toBe('USER_DUPLICATE_EMAIL');
      }),
    );
  });

  it('registro con documento duplicado devuelve error USER_DUPLICATE_DOCUMENT', async () => {
    await fc.assert(
      fc.asyncProperty(registerDataArb, async (data) => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 409,
          statusText: 'Conflict',
          json: async () => ({
            code: 'USER_DUPLICATE_DOCUMENT',
            message: 'El documento ya está registrado',
          }),
        } as Response);

        let thrownError: { code: string; message: string } | null = null;
        try {
          await authService.register(data);
        } catch (err) {
          thrownError = err as { code: string; message: string };
        }

        expect(thrownError).not.toBeNull();
        expect(thrownError?.code).toBe('USER_DUPLICATE_DOCUMENT');
      }),
    );
  });
});
