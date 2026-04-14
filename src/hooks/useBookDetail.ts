import { useState, useEffect, useCallback } from 'react';
import { bookService } from '../services/bookService';
import { BookDetail } from '../types/book';
import { ServiceError, parseError } from '../services/errorHandler';

interface UseBookDetailState {
  book: BookDetail | null;
  isLoading: boolean;
  error: ServiceError | null;
}

interface UseBookDetailReturn extends UseBookDetailState {
  retry: () => void;
  addComment: (text: string) => Promise<void>;
  isSubmittingComment: boolean;
  commentError: ServiceError | null;
}

/**
 * Hook that fetches the full detail of a book by its ID.
 * Exposes book, isLoading, error, retry, addComment, isSubmittingComment, and commentError.
 * Requisitos: 7.1, 7.2, 7.3, 7.4, 7.9, 7.10, 7.11
 */
export function useBookDetail(bookId: string): UseBookDetailReturn {
  const [state, setState] = useState<UseBookDetailState>({
    book: null,
    isLoading: true,
    error: null,
  });
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<ServiceError | null>(null);

  const fetchBook = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const book = await bookService.getBookById(bookId);
      setState({ book, isLoading: false, error: null });
    } catch (err) {
      setState({ book: null, isLoading: false, error: parseError(err) });
    }
  }, [bookId]);

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  const addComment = useCallback(async (text: string) => {
    setIsSubmittingComment(true);
    setCommentError(null);
    try {
      const newComment = await bookService.addComment(bookId, text);
      setState((prev) => {
        if (!prev.book) return prev;
        return {
          ...prev,
          book: {
            ...prev.book,
            comments: [...prev.book.comments, newComment],
          },
        };
      });
    } catch (err) {
      setCommentError(parseError(err));
    } finally {
      setIsSubmittingComment(false);
    }
  }, [bookId]);

  return {
    ...state,
    retry: fetchBook,
    addComment,
    isSubmittingComment,
    commentError,
  };
}
