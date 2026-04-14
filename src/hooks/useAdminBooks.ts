import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { bookService } from '../services/bookService';
import { Book, BookFormData } from '../types/book';
import { ServiceError, parseError } from '../services/errorHandler';

interface UseAdminBooksReturn {
  books: Book[];
  filteredBooks: Book[];
  isLoading: boolean;
  error: ServiceError | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  fetchBooks: () => Promise<void>;
  createBook: (data: BookFormData) => Promise<void>;
  updateBook: (id: string, data: BookFormData) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
}

/**
 * Hook para gestión de libros del administrador.
 * Expone CRUD y filtrado en tiempo real por título o autor.
 * Requisitos: 11.2, 11.3, 11.6, 11.8, 11.10, 11.11
 */
export function useAdminBooks(): UseAdminBooksReturn {
  const [books, setBooks] = useState<Book[]>([]);
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

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await bookService.getBooks();
      setBooks(data);
    } catch (err) {
      setError(parseError(err));
    } finally {
      setIsLoading(false);
    }
  }, [setError]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return books;
    const q = searchQuery.toLowerCase();
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q),
    );
  }, [books, searchQuery]);

  const createBook = useCallback(async (data: BookFormData) => {
    let caughtError: ServiceError | null = null;
    try {
      const newBook = await bookService.createBook(data);
      setBooks((prev) => [...prev, newBook]);
    } catch (err) {
      caughtError = parseError(err);
      setError(caughtError);
    }
    if (caughtError) throw caughtError;
  }, [setError]);

  const updateBook = useCallback(async (id: string, data: BookFormData) => {
    let caughtError: ServiceError | null = null;
    try {
      const updated = await bookService.updateBook(id, data);
      setBooks((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (err) {
      caughtError = parseError(err);
      setError(caughtError);
    }
    if (caughtError) throw caughtError;
  }, [setError]);

  const deleteBook = useCallback(async (id: string) => {
    let caughtError: ServiceError | null = null;
    try {
      await bookService.deleteBook(id);
      setBooks((prev) => prev.filter((b) => b.id !== id));
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
    books,
    filteredBooks,
    isLoading,
    searchQuery,
    setSearchQuery,
    fetchBooks,
    createBook,
    updateBook,
    deleteBook,
  } as UseAdminBooksReturn;

  Object.defineProperty(returnValue, 'error', {
    get: () => errorRef.current,
    enumerable: true,
    configurable: true,
  });

  return returnValue;
}
