/**
 * Feature: librohub-app, Propiedad 7: Round-trip de comentario
 *
 * Para todo libro y cualquier texto de comentario no vacío, enviar el comentario
 * y luego obtener el detalle del libro SHALL incluir ese comentario en la lista
 * de comentarios del libro.
 *
 * Validates: Requirements 7.9, 7.10
 */

import fc from 'fast-check';
import { renderHook, act } from '@testing-library/react-native';
import { useBookDetail } from '../useBookDetail';
import { BookDetail, Comment } from '../../types/book';

fc.configureGlobal({ numRuns: 100 });

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue(null),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../services/bookService', () => ({
  bookService: {
    getBookById: jest.fn(),
    addComment: jest.fn(),
  },
}));

import { bookService } from '../../services/bookService';

const mockGetBookById = bookService.getBookById as jest.Mock;
const mockAddComment = bookService.addComment as jest.Mock;

const commentArb: fc.Arbitrary<Comment> = fc.record({
  id: fc.uuid(),
  userId: fc.uuid(),
  authorName: fc.string({ minLength: 1, maxLength: 40 }),
  avatarUrl: fc.option(fc.webUrl(), { nil: undefined }),
  text: fc.string({ minLength: 1, maxLength: 200 }),
  createdAt: fc
    .integer({ min: new Date('2000-01-01').getTime(), max: new Date('2025-12-31').getTime() })
    .map((ms) => new Date(ms).toISOString()),
});

const bookDetailArb: fc.Arbitrary<BookDetail> = fc
  .array(commentArb, { minLength: 0, maxLength: 10 })
  .chain((existingComments) =>
    fc.record({
      id: fc.uuid(),
      title: fc.string({ minLength: 1, maxLength: 60 }),
      author: fc.string({ minLength: 1, maxLength: 40 }),
      coverUrl: fc.webUrl(),
      category: fc.constantFrom('Fantasía', 'Romance', 'Ciencia Ficción'),
      year: fc.integer({ min: 1900, max: 2025 }),
      status: fc.constantFrom('active' as const, 'coming_soon' as const),
      pages: fc.integer({ min: 1, max: 2000 }),
      language: fc.constantFrom('Español', 'Inglés', 'Francés'),
      isbn: fc.string({ minLength: 10, maxLength: 13 }),
      publisher: fc.string({ minLength: 1, maxLength: 60 }),
      synopsis: fc.string({ minLength: 1, maxLength: 500 }),
      rating: fc.float({ min: 1.0, max: 5.0 }),
      categories: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 3 }),
      comments: fc.constant(existingComments),
      isFavorite: fc.boolean(),
      hasPdf: fc.boolean(),
    }),
  );

describe('Propiedad 7: Round-trip de comentario', () => {
  beforeEach(() => {
    mockGetBookById.mockReset();
    mockAddComment.mockReset();
  });

  it('después de addComment, el comentario aparece en book.comments con N+1 entradas', async () => {
    await fc.assert(
      fc.asyncProperty(
        bookDetailArb,
        fc.string({ minLength: 1 }),
        async (bookDetail, commentText) => {
          const initialCount = bookDetail.comments.length;

          const newComment: Comment = {
            id: 'new-comment-id',
            userId: 'user-1',
            authorName: 'Test User',
            text: commentText,
            createdAt: new Date().toISOString(),
          };

          mockGetBookById.mockResolvedValue(bookDetail);
          mockAddComment.mockResolvedValue(newComment);

          const { result } = renderHook(() => useBookDetail(bookDetail.id));

          await act(async () => {
            await Promise.resolve();
          });

          expect(result.current.book).not.toBeNull();
          expect(result.current.book!.comments).toHaveLength(initialCount);

          await act(async () => {
            await result.current.addComment(commentText);
          });

          expect(result.current.book!.comments).toHaveLength(initialCount + 1);

          const lastComment =
            result.current.book!.comments[result.current.book!.comments.length - 1];
          expect(lastComment.text).toBe(commentText);

          expect(mockAddComment).toHaveBeenCalledWith(bookDetail.id, commentText);
        },
      ),
    );
  });
});
