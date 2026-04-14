/**
 * Feature: librohub-app
 * Propiedad 1: Round-trip de autenticación
 *
 * Para todo par (usuario, contraseña) válido almacenado en el sistema,
 * invocar authService.login con esas credenciales SHALL devolver un AuthResponse
 * con un token no vacío y un rol válido; para todo par inválido, SHALL devolver un error.
 *
 * Validates: Requirements 2.2, 2.5
 */

import fc from 'fast-check';
import { authService } from '../authService';
import { AuthResponse } from '../../types/auth';
import { ServiceError } from '../errorHandler';

fc.configureGlobal({ numRuns: 100 });

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue(null),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const VALID_ROLES = ['reader', 'admin'] as const;

/**
 * Arbitrary for valid credentials (non-empty username and password)
 */
const validCredentialsArb = fc.record({
  username: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
  password: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
});

/**
 * Arbitrary for invalid credentials (empty username or empty password)
 */
const invalidCredentialsArb = fc.oneof(
  // empty username
  fc.record({
    username: fc.constant(''),
    password: fc.string({ minLength: 1, maxLength: 100 }),
  }),
  // empty password
  fc.record({
    username: fc.string({ minLength: 1, maxLength: 50 }),
    password: fc.constant(''),
  }),
);

/**
 * Build a mock AuthResponse for a given username
 */
function buildAuthResponse(username: string): AuthResponse {
  return {
    token: `token-${username}-${Date.now()}`,
    role: VALID_ROLES[username.length % 2],
    userId: `user-${username}`,
  };
}

describe('Propiedad 1: Round-trip de autenticación', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('credenciales válidas devuelven AuthResponse con token no vacío y rol válido', async () => {
    await fc.assert(
      fc.asyncProperty(validCredentialsArb, async (credentials) => {
        const expectedResponse = buildAuthResponse(credentials.username);

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => expectedResponse,
        } as Response);

        const result = await authService.login(credentials);

        // Token must be non-empty
        expect(result.token).toBeTruthy();
        expect(result.token.length).toBeGreaterThan(0);

        // Role must be valid
        expect(VALID_ROLES).toContain(result.role);

        // userId must be present
        expect(result.userId).toBeTruthy();
      }),
    );
  });

  it('credenciales inválidas (rechazadas por el servidor) devuelven un ServiceError', async () => {
    await fc.assert(
      fc.asyncProperty(validCredentialsArb, async (credentials) => {
        // Server rejects with 401
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          json: async () => ({
            code: 'AUTH_INVALID_CREDENTIALS',
            message: 'Usuario o contraseña incorrectos',
          }),
        } as Response);

        let thrownError: ServiceError | null = null;
        try {
          await authService.login(credentials);
        } catch (err) {
          thrownError = err as ServiceError;
        }

        expect(thrownError).not.toBeNull();
        expect(thrownError?.code).toBe('AUTH_INVALID_CREDENTIALS');
        expect(thrownError?.message).toBeTruthy();
      }),
    );
  });

  it('error de red devuelve ServiceError con código NETWORK_ERROR', async () => {
    await fc.assert(
      fc.asyncProperty(validCredentialsArb, async (credentials) => {
        mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));

        let thrownError: ServiceError | null = null;
        try {
          await authService.login(credentials);
        } catch (err) {
          thrownError = err as ServiceError;
        }

        expect(thrownError).not.toBeNull();
        expect(thrownError?.code).toBe('NETWORK_ERROR');
      }),
    );
  });

  it('credenciales con campos vacíos son rechazadas por el servidor con error', async () => {
    await fc.assert(
      fc.asyncProperty(invalidCredentialsArb, async (credentials) => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json: async () => ({
            code: 'AUTH_INVALID_CREDENTIALS',
            message: 'Usuario o contraseña incorrectos',
          }),
        } as Response);

        let thrownError: ServiceError | null = null;
        try {
          await authService.login(credentials);
        } catch (err) {
          thrownError = err as ServiceError;
        }

        expect(thrownError).not.toBeNull();
        expect(thrownError?.code).toBeTruthy();
      }),
    );
  });
});
