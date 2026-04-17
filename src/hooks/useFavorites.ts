import { useState, useCallback } from 'react';
import { bookService } from '../services/bookService';
import { ServiceError, parseError } from '../services/errorHandler';

interface UseFavoritesReturn {
  isFavorite: boolean;
  isToggling: boolean;
  error: ServiceError | null;
  toggleFavorite: () => void;
}

/**
 * Hook that manages the favorite state for a book.
 * Implements optimistic update: flips isFavorite immediately,
 * then reverts if the API call fails.
 * Requisitos: 7.5, 7.6
 */
export function useFavorites(initialIsFavorite: boolean, bookId: string): UseFavoritesReturn {
  const [isFavorite, setIsFavorite] = useState<boolean>(initialIsFavorite);
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const [error, setError] = useState<ServiceError | null>(null);

  const toggleFavorite = useCallback(async () => {
    if (isToggling) return;

    const previous = isFavorite;
    // Optimistic update
    setIsFavorite(!previous);
    setIsToggling(true);
    setError(null);

    try {
      const newState = await bookService.toggleFavorite(bookId);
      setIsFavorite(newState);
    } catch (err) {
      // Revert on failure
      setIsFavorite(previous);
      setError(parseError(err));
    } finally {
      setIsToggling(false);
    }
  }, [bookId, isFavorite, isToggling]);

  return { isFavorite, isToggling, error, toggleFavorite };
}
