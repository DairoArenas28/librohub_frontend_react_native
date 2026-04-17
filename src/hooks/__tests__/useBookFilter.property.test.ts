/**
 * Feature: librohub-app, Propiedad 5: Filtrado metamórfico y de subconjunto
 *
 * Para todo catálogo de libros y cualquier filtro de categoría o año aplicado,
 * el número de libros filtrados SHALL ser menor o igual al número total de
 * libros en el catálogo sin filtro.
 *
 * Validates: Requisito 6.2
 */

import fc from 'fast-check';
import { Book, BookFilters } from '../../types/book';

fc.configureGlobal({ numRuns: 100 });

// ---------------------------------------------------------------------------
// Pure filter logic (mirrors what the backend does and useBookFilter relies on)
// ---------------------------------------------------------------------------

function applyFilters(books: Book[], filters: BookFilters): Book[] {
  return books.filter((book) => {
    if (filters.category && book.category !== filters.category) return false;
    if (filters.year !== undefined && book.year !== filters.year) return false;
    return true;
  });
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const CATEGORIES = ['Fantasía', 'Romance', 'Ciencia Ficción', 'Policiaca', 'Historia'] as const;

const bookArb: fc.Arbitrary<Book> = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 60 }),
  author: fc.string({ minLength: 1, maxLength: 40 }),
  coverUrl: fc.webUrl(),
  category: fc.constantFrom(...CATEGORIES),
  year: fc.integer({ min: 1900, max: 2025 }),
  status: fc.constantFrom('active' as const, 'coming_soon' as const),
});

const catalogArb: fc.Arbitrary<Book[]> = fc.array(bookArb, {
  minLength: 0,
  maxLength: 50,
});

/** Generates a BookFilters object with at least one filter set */
const filtersArb: fc.Arbitrary<BookFilters> = fc.oneof(
  // category only
  fc.record({ category: fc.constantFrom(...CATEGORIES) }),
  // year only
  fc.record({ year: fc.integer({ min: 1900, max: 2025 }) }),
  // both
  fc.record({
    category: fc.constantFrom(...CATEGORIES),
    year: fc.integer({ min: 1900, max: 2025 }),
  }),
);

// ---------------------------------------------------------------------------
// Property tests
// ---------------------------------------------------------------------------

describe('Propiedad 5: Filtrado metamórfico y de subconjunto', () => {
  /**
   * Metamorphic property:
   * filtered count <= total catalog count
   */
  it('el número de libros filtrados es menor o igual al total del catálogo', () => {
    fc.assert(
      fc.property(catalogArb, filtersArb, (catalog, filters) => {
        const filtered = applyFilters(catalog, filters);
        expect(filtered.length).toBeLessThanOrEqual(catalog.length);
      }),
    );
  });

  /**
   * Subset property:
   * every book in the filtered result satisfies the applied filter criteria
   */
  it('cada libro filtrado cumple con los criterios del filtro aplicado', () => {
    fc.assert(
      fc.property(catalogArb, filtersArb, (catalog, filters) => {
        const filtered = applyFilters(catalog, filters);

        for (const book of filtered) {
          if (filters.category !== undefined) {
            expect(book.category).toBe(filters.category);
          }
          if (filters.year !== undefined) {
            expect(book.year).toBe(filters.year);
          }
        }
      }),
    );
  });

  /**
   * Metamorphic: filtering with no filters returns the full catalog
   */
  it('sin filtros el resultado es igual al catálogo completo', () => {
    fc.assert(
      fc.property(catalogArb, (catalog) => {
        const filtered = applyFilters(catalog, {});
        expect(filtered.length).toBe(catalog.length);
      }),
    );
  });

  /**
   * Subset property: filtered results are a subset of the original catalog
   * (every filtered book exists in the original catalog by id)
   */
  it('los libros filtrados son un subconjunto del catálogo original', () => {
    fc.assert(
      fc.property(catalogArb, filtersArb, (catalog, filters) => {
        const filtered = applyFilters(catalog, filters);
        const catalogIds = new Set(catalog.map((b) => b.id));

        for (const book of filtered) {
          expect(catalogIds.has(book.id)).toBe(true);
        }
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// Propiedad 6: Idempotencia del filtrado
// ---------------------------------------------------------------------------

/**
 * Feature: librohub-app, Propiedad 6: Idempotencia del filtrado
 *
 * Para todo catálogo de libros y cualquier combinación de filtros, aplicar el
 * mismo filtro dos veces SHALL producir exactamente el mismo conjunto de
 * resultados que aplicarlo una sola vez.
 *
 * Validates: Requisitos 6.2, 6.3
 */
describe('Propiedad 6: Idempotencia del filtrado', () => {
  /**
   * Applying the same filter twice produces the same result as applying it once
   * (same books, same count).
   */
  it('aplicar el mismo filtro dos veces produce el mismo resultado que aplicarlo una vez', () => {
    fc.assert(
      fc.property(catalogArb, filtersArb, (catalog, filters) => {
        const once = applyFilters(catalog, filters);
        const twice = applyFilters(once, filters);

        // Same count
        expect(twice.length).toBe(once.length);

        // Same books (by id, in same order)
        const onceIds = once.map((b) => b.id);
        const twiceIds = twice.map((b) => b.id);
        expect(twiceIds).toEqual(onceIds);
      }),
    );
  });

  /**
   * The result of filtering an already-filtered set with the same filter
   * equals the first filtered result (deep equality on every book).
   */
  it('filtrar el resultado ya filtrado con el mismo filtro no cambia los libros', () => {
    fc.assert(
      fc.property(catalogArb, filtersArb, (catalog, filters) => {
        const once = applyFilters(catalog, filters);
        const twice = applyFilters(once, filters);

        expect(twice).toEqual(once);
      }),
    );
  });

  /**
   * Idempotency holds for empty filters as well (no-op filter is idempotent).
   */
  it('el filtro vacío es idempotente sobre cualquier catálogo', () => {
    fc.assert(
      fc.property(catalogArb, (catalog) => {
        const once = applyFilters(catalog, {});
        const twice = applyFilters(once, {});

        expect(twice).toEqual(once);
      }),
    );
  });
});
