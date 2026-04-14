import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { bookService } from '../services/bookService';
import { CategoryBooks } from '../types/book';
import { ServiceError, parseError } from '../services/errorHandler';
import { useAppConfig } from '../context/AppConfigContext';

interface UseBooksState {
  data: CategoryBooks[] | null;
  isLoading: boolean;
  /** true solo en el primer fetch, no en los refrescos silenciosos */
  isSilentRefreshing: boolean;
  error: ServiceError | null;
}

interface UseBooksReturn extends Omit<UseBooksState, 'isSilentRefreshing'> {
  isSilentRefreshing: boolean;
  retry: () => void;
}

/**
 * Carga el catálogo de libros agrupado por categoría.
 * - Primer fetch: muestra spinner (isLoading).
 * - Refrescos automáticos (polling + AppState): silenciosos, sin spinner.
 * Requisitos: 5.2, 5.7, 5.8
 */
export function useBooks(): UseBooksReturn {
  const { config } = useAppConfig();
  const pollingInterval = config.catalogPollingSeconds * 1000;

  const [state, setState] = useState<UseBooksState>({
    data: null,
    isLoading: true,
    isSilentRefreshing: false,
    error: null,
  });

  const isMounted = useRef(true);
  const pollingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch inicial — muestra spinner
  const fetchBooks = useCallback(async (silent = false) => {
    if (!isMounted.current) return;
    setState((prev) => ({
      ...prev,
      isLoading: silent ? false : prev.data === null,
      isSilentRefreshing: silent,
      error: null,
    }));
    try {
      const data = await bookService.getBooksByCategory();
      if (!isMounted.current) return;
      setState({ data, isLoading: false, isSilentRefreshing: false, error: null });
    } catch (err) {
      if (!isMounted.current) return;
      // En refresco silencioso no borramos los datos existentes
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isSilentRefreshing: false,
        error: silent ? null : parseError(err), // silencioso: no muestra error
      }));
    }
  }, []);

  // Primer fetch
  useEffect(() => {
    isMounted.current = true;
    fetchBooks(false);
    return () => { isMounted.current = false; };
  }, [fetchBooks]);

  // Polling automático
  useEffect(() => {
    if (pollingInterval <= 0) return;

    pollingTimer.current = setInterval(() => {
      fetchBooks(true);
    }, pollingInterval);

    return () => {
      if (pollingTimer.current) clearInterval(pollingTimer.current);
    };
  }, [fetchBooks, pollingInterval]);

  // Refresco silencioso al volver al frente
  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        fetchBooks(true);
      }
    };
    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [fetchBooks]);

  return {
    ...state,
    retry: () => fetchBooks(false),
  };
}
