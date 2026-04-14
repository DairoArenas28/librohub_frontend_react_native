import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { AuthState, LoginCredentials, UserRole } from '../types/auth';
import { ServiceError, parseError } from '../services/errorHandler';

interface AuthContextValue extends AuthState {
  error: ServiceError | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

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

export function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [state, setState] = useState<AuthState>({
    token: null,
    role: null,
    userId: null,
    isLoading: true,
  });
  const [error, setError] = useState<ServiceError | null>(null);

  useEffect(() => {
    let cancelled = false;
    authService.getStoredToken().then((token) => {
      if (cancelled) return;
      if (token) {
        const { role, userId } = decodeTokenPayload(token);
        setState({ token, role, userId, isLoading: false });
      } else {
        setState({ token: null, role: null, userId: null, isLoading: false });
      }
    });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }));
    setError(null);
    try {
      const response = await authService.login(credentials);
      setState({ token: response.token, role: response.role, userId: response.userId, isLoading: false });
    } catch (err) {
      setState((prev) => ({ ...prev, isLoading: false }));
      setError(parseError(err));
      throw err;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await authService.logout();
    setState({ token: null, role: null, userId: null, isLoading: false });
    setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
  return ctx;
}
