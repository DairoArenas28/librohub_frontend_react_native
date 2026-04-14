import { useState, useCallback } from 'react';
import { authService } from '../services/authService';
import { RegisterData } from '../types/auth';
import { ServiceError } from '../services/errorHandler';

interface UseRegisterReturn {
  isLoading: boolean;
  error: ServiceError | null;
  register: (data: RegisterData) => Promise<void>;
}

/**
 * Hook de registro de usuario.
 * Requisitos: 3.2, 3.5, 3.8
 */
export function useRegister(): UseRegisterReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ServiceError | null>(null);

  const register = useCallback(async (data: RegisterData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.register(data);
    } catch (err) {
      setError(err as ServiceError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, register };
}
