import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { AuthState, LoginCredentials, UserRole } from '../types/auth';
import { ServiceError } from '../services/errorHandler';

interface UseAuthReturn extends AuthState {
  error: ServiceError | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Hook de autenticación.
 * - Restaura el token persistido al montar.
 * - Expone login / logout y el estado de autenticación.
 * Requisitos: 2.2, 2.3, 2.4, 2.6, 12.5, 12.6
 */
export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    token: null,
    role: null,
    userId: null,
    isLoading: true, // true while restoring persisted token
  });
  const [error, setError] = useState<ServiceError | null>(null);

  // Restore persisted token on mount (Req 12.6)
  useEffect(() => {
    let cancelled = false;
    authService.getStoredToken().then((token) => {
      if (cancelled) return;
      if (token) {
        // Decode role/userId from token payload (JWT base64 middle segment)
        const { role, userId } = decodeTokenPayload(token);
        setState({ token, role, userId, isLoading: false });
      } else {
        setState({ token: null, role: null, userId: null, isLoading: false });
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }));
    setError(null);
    try {
      const response = await authService.login(credentials);
      setState({
        token: response.token,
        role: response.role,
        userId: response.userId,
        isLoading: false,
      });
    } catch (err) {
      setState((prev) => ({ ...prev, isLoading: false }));
      setError(err as ServiceError);
      throw err;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await authService.logout();
    setState({ token: null, role: null, userId: null, isLoading: false });
    setError(null);
  }, []);

  return { ...state, error, login, logout };
}

/**
 * Decode JWT payload to extract role and userId.
 * Falls back gracefully if the token is not a valid JWT.
 */
function decodeTokenPayload(token: string): { role: UserRole | null; userId: string | null } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { role: null, userId: null };
    const payload = JSON.parse(atob(parts[1]));
    return {
      role: (payload.role as UserRole) ?? null,
      userId: (payload.userId ?? payload.sub ?? null) as string | null,
    };
  } catch {
    return { role: null, userId: null };
  }
}
