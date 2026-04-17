import { useState, useCallback } from 'react';
import { bookService } from '../services/bookService';
import { Book, BookFilters } from '../types/book';
import { ServiceError, parseError } from '../services/errorHandler';

interface UseBookFilterState {
  filteredBooks: Book[];
  isLoading: boolean;
  error: ServiceError | null;
  noResults: boolean;
  hasFiltered: boolean;
}

interface UseBookFilterReturn {
  filteredBooks: Book[];
  isLoading: boolean;
  error: ServiceError | null;
  noResults: boolean;
  applyFilters: (filters: BookFilters) => void;
  clearFilters: () => void;
}

/**
 * Hook that filters the book catalog by category and/or year.
 * Exposes filteredBooks, isLoading, error, noResults, applyFilters, clearFilters.
 * Requisitos: 6.2, 6.3, 6.4, 6.5
 */
export function useBookFilter(): UseBookFilterReturn {
  const [state, setState] = useState<UseBookFilterState>({
    filteredBooks: [],
    isLoading: false,
    error: null,
    noResults: false,
    hasFiltered: false,
  });

  const applyFilters = useCallback(async (filters: BookFilters) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const books = await bookService.getBooks(filters);
      setState({
        filteredBooks: books,
        isLoading: false,
        error: null,
        noResults: books.length === 0,
        hasFiltered: true,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: parseError(err),
        hasFiltered: true,
      }));
    }
  }, []);

  const clearFilters = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const books = await bookService.getBooks();
      setState({
        filteredBooks: books,
        isLoading: false,
        error: null,
        noResults: false,
        hasFiltered: false,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: parseError(err),
      }));
    }
  }, []);

  return {
    filteredBooks: state.filteredBooks,
    isLoading: state.isLoading,
    error: state.error,
    noResults: state.noResults,
    applyFilters,
    clearFilters,
  };
}
