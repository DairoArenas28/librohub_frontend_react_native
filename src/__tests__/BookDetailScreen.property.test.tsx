/**
 * Feature: pdf-book-upload-reader, Property 5: El botón Leer refleja la disponibilidad del PDF
 *
 * Para cualquier valor booleano de `hasPdf`, el botón "Leer" en BookDetailScreen
 * SHALL mostrar el elemento con testID="read-button" cuando hasPdf es true,
 * y el elemento con testID="read-button-disabled" cuando hasPdf es false.
 *
 * Validates: Requirements 6.1, 6.2
 */

import React from 'react';
import fc from 'fast-check';
import { render } from '@testing-library/react-native';
import { BookDetail } from '../types/book';

fc.configureGlobal({ numRuns: 100 });

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue('mock-token'),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../hooks/useBookDetail');
jest.mock('../hooks/useFavorites');
jest.mock('../services/bookService', () => ({
  bookService: {
    getBookById: jest.fn(),
    addComment: jest.fn(),
    toggleFavorite: jest.fn(),
    getPdfUrl: jest.fn().mockReturnValue('http://localhost/books/1/pdf'),
  },
  resolveCoverUrl: jest.fn((url: string) => url),
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../components/StarRating', () => {
  const { View } = require('react-native');
  return function StarRating() {
    return <View testID="star-rating" />;
  };
});

jest.mock('../components/CommentItem', () => {
  const { View } = require('react-native');
  return function CommentItem() {
    return <View testID="comment-item" />;
  };
});

jest.mock('../components/CommentInput', () => {
  const { View } = require('react-native');
  return function CommentInput() {
    return <View testID="comment-input" />;
  };
});

// ── Imports after mocks ───────────────────────────────────────────────────────

import { useBookDetail } from '../hooks/useBookDetail';
import { useFavorites } from '../hooks/useFavorites';
import BookDetailScreen from '../screens/reader/BookDetailScreen';

const mockUseBookDetail = useBookDetail as jest.Mock;
const mockUseFavorites = useFavorites as jest.Mock;

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildBookDetail(hasPdf: boolean): BookDetail {
  return {
    id: 'book-1',
    title: 'Test Book',
    author: 'Test Author',
    coverUrl: 'https://example.com/cover.jpg',
    category: 'Ficción',
    year: 2024,
    status: 'active',
    pages: 300,
    language: 'Español',
    isbn: '978-0000000000',
    publisher: 'Editorial Test',
    synopsis: 'Una sinopsis de prueba.',
    rating: 4.0,
    categories: ['Ficción'],
    comments: [],
    isFavorite: false,
    hasPdf,
  };
}

function buildNavigationProps(bookId: string) {
  return {
    route: { params: { bookId }, key: 'BookDetail', name: 'BookDetail' as const },
    navigation: {
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
      reset: jest.fn(),
      setParams: jest.fn(),
      setOptions: jest.fn(),
      isFocused: jest.fn().mockReturnValue(true),
      canGoBack: jest.fn().mockReturnValue(true),
      addListener: jest.fn().mockReturnValue(() => {}),
      removeListener: jest.fn(),
      getId: jest.fn(),
      getParent: jest.fn(),
      getState: jest.fn(),
    },
  } as any;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Property 5: El botón "Leer" refleja la disponibilidad del PDF', () => {
  beforeEach(() => {
    mockUseFavorites.mockReturnValue({
      isFavorite: false,
      isToggling: false,
      error: null,
      toggleFavorite: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('cuando hasPdf es true, muestra read-button; cuando es false, muestra read-button-disabled', () => {
    fc.assert(
      fc.property(fc.boolean(), (hasPdf) => {
        const book = buildBookDetail(hasPdf);

        mockUseBookDetail.mockReturnValue({
          book,
          isLoading: false,
          error: null,
          retry: jest.fn(),
          addComment: jest.fn(),
          isSubmittingComment: false,
          commentError: null,
        });

        const props = buildNavigationProps(book.id);
        const { queryByTestId, unmount } = render(<BookDetailScreen {...props} />);

        if (hasPdf) {
          expect(queryByTestId('read-button')).not.toBeNull();
          expect(queryByTestId('read-button-disabled')).toBeNull();
        } else {
          expect(queryByTestId('read-button-disabled')).not.toBeNull();
          expect(queryByTestId('read-button')).toBeNull();
        }

        unmount();
      }),
    );
  });
});
