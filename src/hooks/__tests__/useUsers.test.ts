/**
 * Unit tests for useUsers hook
 * Validates: Requirements 10.2, 10.3, 10.6, 10.8, 10.10, 10.11
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useUsers } from '../useUsers';
import { userService } from '../../services/userService';
import { User, UserFormData } from '../../types/user';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../services/userService');

const mockUserService = userService as jest.Mocked<typeof userService>;

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: '1',
  name: 'Ana García',
  document: '12345678',
  email: 'ana@example.com',
  phone: '555-0001',
  role: 'reader',
  isActive: true,
  hasAvatar: false,
  avatarBase64: null,
  ...overrides,
});

const formData: UserFormData = {
  name: 'Ana García',
  document: '12345678',
  email: 'ana@example.com',
  phone: '555-0001',
  role: 'reader',
};

describe('useUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches users on mount (Req 10.2)', async () => {
    const users = [makeUser()];
    mockUserService.getUsers.mockResolvedValueOnce(users);

    const { result } = renderHook(() => useUsers());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.users).toEqual(users);
    expect(result.current.error).toBeNull();
  });

  it('sets error when fetchUsers fails (Req 10.11)', async () => {
    const serviceError = { code: 'NETWORK_ERROR', message: 'Sin conexión' };
    mockUserService.getUsers.mockRejectedValueOnce(serviceError);

    const { result } = renderHook(() => useUsers());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toEqual(serviceError);
    expect(result.current.users).toEqual([]);
  });

  describe('filtering (Req 10.3)', () => {
    const users = [
      makeUser({ id: '1', name: 'Ana García', document: '11111111', email: 'ana@test.com' }),
      makeUser({ id: '2', name: 'Carlos López', document: '22222222', email: 'carlos@test.com' }),
      makeUser({ id: '3', name: 'María Pérez', document: '33333333', email: 'maria@test.com' }),
    ];

    beforeEach(() => {
      mockUserService.getUsers.mockResolvedValue(users);
    });

    it('returns all users when query is empty', async () => {
      const { result } = renderHook(() => useUsers());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.filteredUsers).toHaveLength(3);
    });

    it('filters by name (case-insensitive)', async () => {
      const { result } = renderHook(() => useUsers());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.setSearchQuery('ana'));

      expect(result.current.filteredUsers).toHaveLength(1);
      expect(result.current.filteredUsers[0].name).toBe('Ana García');
    });

    it('filters by document', async () => {
      const { result } = renderHook(() => useUsers());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.setSearchQuery('22222222'));

      expect(result.current.filteredUsers).toHaveLength(1);
      expect(result.current.filteredUsers[0].id).toBe('2');
    });

    it('filters by email', async () => {
      const { result } = renderHook(() => useUsers());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.setSearchQuery('maria@test'));

      expect(result.current.filteredUsers).toHaveLength(1);
      expect(result.current.filteredUsers[0].id).toBe('3');
    });

    it('returns empty array when no match', async () => {
      const { result } = renderHook(() => useUsers());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.setSearchQuery('zzznomatch'));

      expect(result.current.filteredUsers).toHaveLength(0);
    });
  });

  it('createUser adds user to list (Req 10.10)', async () => {
    mockUserService.getUsers.mockResolvedValueOnce([]);
    const newUser = makeUser({ id: '99' });
    mockUserService.createUser.mockResolvedValueOnce(newUser);

    const { result } = renderHook(() => useUsers());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.createUser(formData);
    });

    expect(result.current.users).toContainEqual(newUser);
  });

  it('updateUser replaces user in list (Req 10.6)', async () => {
    const original = makeUser({ id: '1', name: 'Old Name' });
    mockUserService.getUsers.mockResolvedValueOnce([original]);
    const updated = makeUser({ id: '1', name: 'New Name' });
    mockUserService.updateUser.mockResolvedValueOnce(updated);

    const { result } = renderHook(() => useUsers());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateUser('1', { ...formData, name: 'New Name' });
    });

    expect(result.current.users[0].name).toBe('New Name');
  });

  it('deleteUser removes user from list (Req 10.8)', async () => {
    const users = [makeUser({ id: '1' }), makeUser({ id: '2' })];
    mockUserService.getUsers.mockResolvedValueOnce(users);
    mockUserService.deleteUser.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useUsers());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.deleteUser('1');
    });

    expect(result.current.users).toHaveLength(1);
    expect(result.current.users[0].id).toBe('2');
  });

  it('sets error and rethrows when createUser fails (Req 10.11)', async () => {
    mockUserService.getUsers.mockResolvedValueOnce([]);
    const serviceError = { code: 'SERVER_ERROR', message: 'Error interno' };
    mockUserService.createUser.mockRejectedValueOnce(serviceError);

    const { result } = renderHook(() => useUsers());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await expect(
      act(async () => {
        await result.current.createUser(formData);
      }),
    ).rejects.toEqual(serviceError);

    expect(result.current.error).toEqual(serviceError);
  });
});
