import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { userService } from '../services/userService';
import { User, UserFormData } from '../types/user';
import { ServiceError, parseError } from '../services/errorHandler';

interface UseUsersReturn {
  users: User[];
  filteredUsers: User[];
  isLoading: boolean;
  error: ServiceError | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  fetchUsers: () => Promise<void>;
  createUser: (data: UserFormData) => Promise<void>;
  updateUser: (id: string, data: UserFormData) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

/**
 * Hook para gestión de usuarios del administrador.
 * Expone CRUD y filtrado en tiempo real por nombre, documento o correo.
 * Requisitos: 10.2, 10.3, 10.6, 10.8, 10.10, 10.11
 */
export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [, setErrorTick] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  // errorRef is updated synchronously so callers can read it immediately after
  // a mutation throws, even before React commits the next render.
  const errorRef = useRef<ServiceError | null>(null);

  const setError = useCallback((err: ServiceError | null) => {
    errorRef.current = err;
    setErrorTick((t) => t + 1); // trigger re-render so state-based reads also update
  }, []);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      setError(parseError(err));
    } finally {
      setIsLoading(false);
    }
  }, [setError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.document.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }, [users, searchQuery]);

  const createUser = useCallback(async (data: UserFormData) => {
    let caughtError: ServiceError | null = null;
    try {
      const newUser = await userService.createUser(data);
      setUsers((prev) => [...prev, newUser]);
    } catch (err) {
      caughtError = parseError(err);
      setError(caughtError);
    }
    if (caughtError) throw caughtError;
  }, [setError]);

  const updateUser = useCallback(async (id: string, data: UserFormData) => {
    let caughtError: ServiceError | null = null;
    try {
      const updated = await userService.updateUser(id, data);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (err) {
      caughtError = parseError(err);
      setError(caughtError);
    }
    if (caughtError) throw caughtError;
  }, [setError]);

  const deleteUser = useCallback(async (id: string) => {
    let caughtError: ServiceError | null = null;
    try {
      await userService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      caughtError = parseError(err);
      setError(caughtError);
    }
    if (caughtError) throw caughtError;
  }, [setError]);

  // Build the return object with a getter for `error` so that it reads the
  // latest value from the ref even before React commits the next render.
  // This ensures that after a mutation throws, callers can immediately read
  // the error without waiting for a re-render.
  const returnValue = {
    users,
    filteredUsers,
    isLoading,
    searchQuery,
    setSearchQuery,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  } as UseUsersReturn;

  Object.defineProperty(returnValue, 'error', {
    get: () => errorRef.current,
    enumerable: true,
    configurable: true,
  });

  return returnValue;
}
