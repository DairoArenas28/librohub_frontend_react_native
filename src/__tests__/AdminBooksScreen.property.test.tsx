/**
 * Feature: pdf-book-upload-reader, Property 7: Indicador de PDF en lista de administración
 *
 * Para cualquier array de libros con `hasPdf` booleano arbitrario, la pantalla de
 * administración SHALL mostrar el indicador de PDF (testID="pdf-indicator-{id}")
 * exactamente para los libros con hasPdf: true, y NO mostrarlo para los libros
 * con hasPdf: false.
 *
 * Validates: Requirements 6.3
 */

import React from 'react';
import fc from 'fast-check';
import { render } from '@testing-library/react-native';

fc.configureGlobal({ numRuns: 50 });

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue('mock-token'),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../hooks/useAdminBooks');

jest.mock('../services/bookService', () => ({
  bookService: {
    getBooks: jest.fn().mockResolvedValue([]),
    deleteBook: jest.fn().mockResolvedValue(undefined),
  },
  resolveCoverUrl: jest.fn((url: string) => url ?? null),
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
  useFocusEffect: (cb: () => void) => { cb(); },
}));

// ── Imports after mocks ───────────────────────────────────────────────────────

import { useAdminBooks } from '../hooks/useAdminBooks';
import BooksScreen from '../screens/admin/BooksScreen';

const mockUseAdminBooks = useAdminBooks as jest.Mock;

// ── Helpers ───────────────────────────────────────────────────────────────────

type BookStub = { id: string; title: string; hasPdf: boolean };

function setupMockWithBooks(books: BookStub[]) {
  const fullBooks = books.map((b) => ({
    id: b.id,
    title: b.title,
    author: 'Autor',
    coverUrl: '',
    category: 'Ficción',
    year: 2024,
    status: 'active' as const,
    hasPdf: b.hasPdf,
  }));

  mockUseAdminBooks.mockReturnValue({
    books: fullBooks,
    filteredBooks: fullBooks,
    isLoading: false,
    error: null,
    searchQuery: '',
    setSearchQuery: jest.fn(),
    fetchBooks: jest.fn().mockResolvedValue(undefined),
    createBook: jest.fn().mockResolvedValue(undefined),
    updateBook: jest.fn().mockResolvedValue(undefined),
    deleteBook: jest.fn().mockResolvedValue(undefined),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Property 7: Indicador de PDF en lista de administración', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('muestra el indicador pdf-indicator-{id} exactamente para los libros con hasPdf: true', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            title: fc.string({ minLength: 1 }),
            hasPdf: fc.boolean(),
          }),
        ),
        (books) => {
          setupMockWithBooks(books);

          const { queryByTestId, unmount } = render(<BooksScreen />);

          for (const book of books) {
            const indicator = queryByTestId(`pdf-indicator-${book.id}`);
            if (book.hasPdf) {
              expect(indicator).not.toBeNull();
            } else {
              expect(indicator).toBeNull();
            }
          }

          unmount();
        },
      ),
    );
  });
});
