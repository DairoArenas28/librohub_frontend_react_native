/**
 * Feature: librohub-app, Propiedad 10: Round-trip CRUD de libros e idempotencia de actualización
 *
 * Para todo conjunto de datos de libro válido:
 * - Crear un libro y luego buscarlo por prefijo de título SHALL incluir ese libro en filteredBooks.
 * - Eliminar un libro SHALL reducir el conteo de la lista en exactamente uno.
 * - Actualizar un libro con los mismos datos dos veces SHALL producir el mismo estado que actualizarlo una sola vez.
 *
 * Validates: Requirements 11.2, 11.8, 11.10
 */

// Feature: librohub-app, Propiedad 10: Round-trip CRUD de libros e idempotencia de actualización

import fc from 'fast-check';
import { renderHook, act } from '@testing-library/react-native';
import { useAdminBooks } from '../useAdminBooks';
import { bookService } from '../../services/bookService';
import { Book, BookFormData } from '../../types/book';

fc.configureGlobal({ numRuns: 100 });

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../services/bookService');

const mockBookService = bookService as jest.Mocked<typeof bookService>;

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Generates a non-empty string of letters/spaces (2–30 chars) */
const titleArb = fc
  .stringMatching(/^[A-Za-záéíóúÁÉÍÓÚñÑ ]{2,30}$/)
  .filter((s) => s.trim().length >= 2);

const authorArb = fc
  .stringMatching(/^[A-Za-záéíóúÁÉÍÓÚñÑ ]{2,30}$/)
  .filter((s) => s.trim().length >= 2);

/** Arbitrary for BookFormData */
const bookFormDataArb: fc.Arbitrary<BookFormData> = fc.record({
  title: titleArb,
  author: authorArb,
  coverUrl: fc.webUrl(),
  year: fc.integer({ min: 1900, max: 2100 }),
  pages: fc.integer({ min: 1, max: 2000 }),
  language: fc.constantFrom('es', 'en', 'fr', 'pt'),
  isbn: fc.stringMatching(/^[0-9]{10,13}$/),
  publisher: fc
    .stringMatching(/^[A-Za-z ]{2,30}$/)
    .filter((s) => s.trim().length >= 2),
  synopsis: fc.string({ minLength: 10, maxLength: 200 }),
  categories: fc.array(fc.string({ minLength: 2, maxLength: 20 }), {
    minLength: 1,
    maxLength: 5,
  }),
  status: fc.constantFrom('active' as const, 'coming_soon' as const),
});

/** Builds a Book from BookFormData with a given id */
function makeBook(id: string, data: BookFormData): Book {
  return {
    id,
    title: data.title,
    author: data.author,
    coverUrl: data.coverUrl,
    category: data.categories[0] ?? 'general',
    year: new Date().getFullYear(),
    status: data.status,
  };
}

/** Arbitrary for a non-empty list of Books (1–10 items) with unique ids */
const bookListArb: fc.Arbitrary<Book[]> = fc
  .array(
    fc.record({
      id: fc.uuid(),
      title: titleArb,
      author: authorArb,
      coverUrl: fc.webUrl(),
      category: fc.string({ minLength: 2, maxLength: 20 }),
      year: fc.integer({ min: 1900, max: 2100 }),
      status: fc.constantFrom('active' as const, 'coming_soon' as const),
    }),
    { minLength: 1, maxLength: 10 },
  )
  .filter((books) => {
    const ids = books.map((b) => b.id);
    return new Set(ids).size === ids.length;
  });

/** Flush all pending microtasks / resolved promises */
async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Propiedad 10: Round-trip CRUD de libros e idempotencia de actualización', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it(
    'Propiedad 10a: Create → Search round-trip — buscar por prefijo de título incluye el libro creado (Req 11.10, 11.2)',
    async () => {
      await fc.assert(
        fc.asyncProperty(bookFormDataArb, async (formData) => {
          const newBook = makeBook('new-book-id', formData);

          mockBookService.getBooks.mockResolvedValueOnce([]);
          mockBookService.createBook.mockResolvedValueOnce(newBook);

          const { result } = renderHook(() => useAdminBooks());

          // Flush the initial fetchBooks call
          await flushPromises();

          // Create the book
          await act(async () => {
            await result.current.createBook(formData);
          });

          // Search by a prefix of the book's title
          const searchTerm = formData.title
            .trim()
            .slice(0, Math.max(2, Math.floor(formData.title.trim().length / 2)));
          act(() => {
            result.current.setSearchQuery(searchTerm);
          });

          // The created book must appear in filteredBooks
          const found = result.current.filteredBooks.some((b) => b.id === newBook.id);
          expect(found).toBe(true);
        }),
      );
    },
    30000,
  );

  it(
    'Propiedad 10b: Delete reduces count by exactly one (Req 11.8)',
    async () => {
      await fc.assert(
        fc.asyncProperty(bookListArb, async (books) => {
          const targetBook = books[0];

          mockBookService.getBooks.mockResolvedValueOnce([...books]);
          mockBookService.deleteBook.mockResolvedValueOnce(undefined);

          const { result } = renderHook(() => useAdminBooks());
          await flushPromises();

          const countBefore = result.current.books.length;

          await act(async () => {
            await result.current.deleteBook(targetBook.id);
          });

          const countAfter = result.current.books.length;

          // Invariant: count reduced by exactly 1
          expect(countAfter).toBe(countBefore - 1);
          expect(result.current.books.some((b) => b.id === targetBook.id)).toBe(false);
        }),
      );
    },
    30000,
  );

  it(
    'Propiedad 10c: Update idempotence — actualizar dos veces con los mismos datos produce el mismo estado que una sola actualización (Req 11.2)',
    async () => {
      await fc.assert(
        fc.asyncProperty(bookListArb, bookFormDataArb, async (books, updatedData) => {
          const targetBook = books[0];
          const updatedBook = makeBook(targetBook.id, updatedData);

          // First update run
          mockBookService.getBooks.mockResolvedValueOnce([...books]);
          mockBookService.updateBook.mockResolvedValueOnce(updatedBook);

          const { result: result1 } = renderHook(() => useAdminBooks());
          await flushPromises();

          await act(async () => {
            await result1.current.updateBook(targetBook.id, updatedData);
          });

          const stateAfterFirst = result1.current.books.find(
            (b) => b.id === targetBook.id,
          );
          const lengthAfterFirst = result1.current.books.length;

          // Second update run (same data, same result from service)
          mockBookService.getBooks.mockResolvedValueOnce([...books]);
          mockBookService.updateBook.mockResolvedValueOnce(updatedBook);

          const { result: result2 } = renderHook(() => useAdminBooks());
          await flushPromises();

          // Apply update twice
          await act(async () => {
            await result2.current.updateBook(targetBook.id, updatedData);
          });

          mockBookService.updateBook.mockResolvedValueOnce(updatedBook);

          await act(async () => {
            await result2.current.updateBook(targetBook.id, updatedData);
          });

          const stateAfterSecond = result2.current.books.find(
            (b) => b.id === targetBook.id,
          );
          const lengthAfterSecond = result2.current.books.length;

          // Invariant: same book data and same list length regardless of how many times updated
          expect(lengthAfterSecond).toBe(lengthAfterFirst);
          expect(stateAfterSecond).toEqual(stateAfterFirst);
        }),
      );
    },
    30000,
  );
});
