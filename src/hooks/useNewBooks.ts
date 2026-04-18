import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Book, CategoryBooks } from '../types/book';

const SEEN_KEY = 'seen_book_ids';

export interface UseNewBooksReturn {
  newBooks: Book[];
  hasNew: boolean;
  markAsSeen: () => Promise<void>;
}

export function useNewBooks(data: CategoryBooks[] | null): UseNewBooksReturn {
  const [newBooks, setNewBooks] = useState<Book[]>([]);

  useEffect(() => {
    if (!data) return;

    const allBooks: Book[] = data.flatMap((c) => c.books);

    SecureStore.getItemAsync(SEEN_KEY).then((raw) => {
      const seenIds: string[] = raw ? JSON.parse(raw) : [];

      if (seenIds.length === 0) {
        // Primera visita — guardar todos como vistos sin notificar
        const ids = allBooks.map((b) => b.id);
        SecureStore.setItemAsync(SEEN_KEY, JSON.stringify(ids));
        setNewBooks([]);
        return;
      }

      const seenSet = new Set(seenIds);
      const unseen = allBooks.filter((b) => !seenSet.has(b.id));
      setNewBooks(unseen);
    });
  }, [data]);

  const markAsSeen = useCallback(async () => {
    if (!data) return;
    const allIds = data.flatMap((c) => c.books).map((b) => b.id);
    await SecureStore.setItemAsync(SEEN_KEY, JSON.stringify(allIds));
    setNewBooks([]);
  }, [data]);

  return {
    newBooks,
    hasNew: newBooks.length > 0,
    markAsSeen,
  };
}
