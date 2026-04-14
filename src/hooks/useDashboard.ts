import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';
import { DashboardStats } from '../types/user';
import { ServiceError, parseError } from '../services/errorHandler';

interface UseDashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: ServiceError | null;
}

interface UseDashboardReturn extends UseDashboardState {
  retry: () => void;
  fetchStats: () => Promise<void>;
}

/**
 * Hook that fetches dashboard statistics (users and books counts).
 * Exposes stats, isLoading, error, and retry.
 * Requisitos: 9.2, 9.7, 9.8
 */
export function useDashboard(): UseDashboardReturn {
  const [state, setState] = useState<UseDashboardState>({
    stats: null,
    isLoading: true,
    error: null,
  });

  const fetchStats = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const stats = await userService.getDashboardStats();
      setState({ stats, isLoading: false, error: null });
    } catch (err) {
      setState({ stats: null, isLoading: false, error: parseError(err) });
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    ...state,
    retry: fetchStats,
    fetchStats,
  };
}
