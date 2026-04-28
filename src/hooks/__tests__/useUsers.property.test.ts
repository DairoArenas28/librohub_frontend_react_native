/**
 * Feature: librohub-app, Propiedad 9: Round-trip CRUD de usuarios
 *
 * Para todo conjunto de datos de usuario válido:
 * - Crear un usuario y luego buscarlo por nombre SHALL incluir ese usuario en filteredUsers.
 * - Eliminar un usuario SHALL reducir el conteo de la lista en exactamente uno.
 * - Actualizar un usuario SHALL preservar el conteo total de usuarios.
 *
 * Validates: Requirements 10.2, 10.8, 10.10
 */

// Feature: librohub-app, Propiedad 9: Round-trip CRUD de usuarios

import fc from 'fast-check';
import { renderHook, act } from '@testing-library/react-native';
import { useUsers } from '../useUsers';
import { userService } from '../../services/userService';
import { User, UserFormData } from '../../types/user';

fc.configureGlobal({ numRuns: 100 });

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../services/userService');

const mockUserService = userService as jest.Mocked<typeof userService>;

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Generates a valid name: at least 2 chars, letters and spaces */
const nameArb = fc
  .stringMatching(/^[A-Za-záéíóúÁÉÍÓÚñÑ ]{2,30}$/)
  .filter((s) => s.trim().length >= 2);

/** Generates a valid document: 6–12 digits */
const documentArb = fc.stringMatching(/^[0-9]{6,12}$/);

/** Generates a valid phone: 7–15 digits */
const phoneArb = fc.stringMatching(/^[0-9]{7,15}$/);

/** Arbitrary for UserFormData */
const userFormDataArb: fc.Arbitrary<UserFormData> = fc.record({
  name: nameArb,
  document: documentArb,
  email: fc.emailAddress(),
  phone: phoneArb,
  role: fc.constantFrom('reader' as const, 'admin' as const),
});

/** Builds a User from UserFormData with a given id */
function makeUser(id: string, data: UserFormData): User {
  return {
    id,
    name: data.name,
    document: data.document,
    email: data.email,
    phone: data.phone,
    role: data.role,
    isActive: true,
    hasAvatar: false,
    avatarBase64: null,
  };
}

/** Arbitrary for a non-empty list of Users (1–10 items) with unique ids */
const userListArb: fc.Arbitrary<User[]> = fc
  .array(
    fc.record({
      id: fc.uuid(),
      name: nameArb,
      document: documentArb,
      email: fc.emailAddress(),
      phone: phoneArb,
      role: fc.constantFrom('reader' as const, 'admin' as const),
      isActive: fc.boolean(),
      hasAvatar: fc.boolean(),
      avatarBase64: fc.option(fc.string(), { nil: null }),
    }),
    { minLength: 1, maxLength: 10 },
  )
  .filter((users) => {
    const ids = users.map((u) => u.id);
    return new Set(ids).size === ids.length;
  });

/** Flush all pending microtasks / resolved promises */
async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Propiedad 9: Round-trip CRUD de usuarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it(
    'Propiedad 9a: Create → Search round-trip — buscar por nombre incluye el usuario creado (Req 10.10, 10.2)',
    async () => {
      await fc.assert(
        fc.asyncProperty(userFormDataArb, async (formData) => {
          const newUser = makeUser('new-user-id', formData);

          mockUserService.getUsers.mockResolvedValueOnce([]);
          mockUserService.createUser.mockResolvedValueOnce(newUser);

          const { result } = renderHook(() => useUsers());

          // Flush the initial fetchUsers call
          await flushPromises();

          // Create the user
          await act(async () => {
            await result.current.createUser(formData);
          });

          // Search by a prefix of the user's name
          const searchTerm = formData.name
            .trim()
            .slice(0, Math.max(2, Math.floor(formData.name.trim().length / 2)));
          act(() => {
            result.current.setSearchQuery(searchTerm);
          });

          // The created user must appear in filteredUsers
          const found = result.current.filteredUsers.some((u) => u.id === newUser.id);
          expect(found).toBe(true);
        }),
      );
    },
    30000,
  );

  it(
    'Propiedad 9b: Delete reduces count by exactly one (Req 10.8)',
    async () => {
      await fc.assert(
        fc.asyncProperty(userListArb, async (users) => {
          const targetUser = users[0];

          mockUserService.getUsers.mockResolvedValueOnce([...users]);
          mockUserService.deleteUser.mockResolvedValueOnce(undefined);

          const { result } = renderHook(() => useUsers());
          await flushPromises();

          const countBefore = result.current.users.length;

          await act(async () => {
            await result.current.deleteUser(targetUser.id);
          });

          const countAfter = result.current.users.length;

          // Invariant: count reduced by exactly 1
          expect(countAfter).toBe(countBefore - 1);
          expect(result.current.users.some((u) => u.id === targetUser.id)).toBe(false);
        }),
      );
    },
    30000,
  );

  it(
    'Propiedad 9c: Update preserves list length (Req 10.2)',
    async () => {
      await fc.assert(
        fc.asyncProperty(userListArb, userFormDataArb, async (users, updatedData) => {
          const targetUser = users[0];
          const updatedUser = makeUser(targetUser.id, updatedData);

          mockUserService.getUsers.mockResolvedValueOnce([...users]);
          mockUserService.updateUser.mockResolvedValueOnce(updatedUser);

          const { result } = renderHook(() => useUsers());
          await flushPromises();

          const countBefore = result.current.users.length;

          await act(async () => {
            await result.current.updateUser(targetUser.id, updatedData);
          });

          const countAfter = result.current.users.length;

          // Invariant: list length unchanged after update
          expect(countAfter).toBe(countBefore);
        }),
      );
    },
    30000,
  );
});
