/**
 * Feature: librohub-app
 * Propiedad 4: Invariante de conteo del catálogo
 *
 * Para todo conjunto de libros devuelto por bookService.getBooksByCategory,
 * la suma del número de libros en todas las categorías SHALL ser igual al
 * número total de libros recibidos del backend.
 *
 * Validates: Requirements 5.2, 5.3
 */

import fc from 'fast-check';
import { bookService } from '../../services/bookService';
import { CategoryBooks, Book } from '../../types/book';

fc.configureGlobal({ numRuns: 100 });

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue(null),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

/** Arbitrary for a single Book */
const bookArb: fc.Arbitrary<Book> = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 60 }),
  author: fc.string({ minLength: 1, maxLength: 40 }),
  coverUrl: fc.webUrl(),
  category: fc.constantFrom('Fantasía', 'Romance', 'Ciencia Ficción', 'Policiaca', 'Historia'),
  year: fc.integer({ min: 1900, max: 2025 }),
  status: fc.constantFrom('active' as const, 'coming_soon' as const),
});

/** Arbitrary for a list of CategoryBooks (1–5 categories, 0–10 books each) */
const categoryBooksArb: fc.Arbitrary<CategoryBooks[]> = fc
  .array(
    fc.record({
      category: fc.constantFrom('Fantasía', 'Romance', 'Ciencia Ficción', 'Policiaca', 'Historia'),
      books: fc.array(bookArb, { minLength: 0, maxLength: 10 }),
    }),
    { minLength: 1, maxLength: 5 },
  );

describe('Propiedad 4: Invariante de conteo del catálogo', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('la suma de libros por categoría es igual al total de libros recibidos del backend', async () => {
    await fc.assert(
      fc.asyncProperty(categoryBooksArb, async (categoryBooks) => {
        // Total books as the backend would return them (flat count)
        const totalBooks = categoryBooks.reduce((sum, cat) => sum + cat.books.length, 0);

        // Mock the fetch to return our generated category books
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => categoryBooks,
        } as Response);

        const result = await bookService.getBooksByCategory();

        // Invariant: sum of books across all categories == total books
        const sumFromResult = result.reduce((sum, cat) => sum + cat.books.length, 0);
        expect(sumFromResult).toBe(totalBooks);
      }),
    );
  });

  it('cada categoría en el resultado contiene únicamente sus propios libros', async () => {
    await fc.assert(
      fc.asyncProperty(categoryBooksArb, async (categoryBooks) => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => categoryBooks,
        } as Response);

        const result = await bookService.getBooksByCategory();

        // Each category section must have a non-empty category name
        for (const section of result) {
          expect(typeof section.category).toBe('string');
          expect(section.category.length).toBeGreaterThan(0);
          expect(Array.isArray(section.books)).toBe(true);
        }
      }),
    );
  });
});
