import * as SecureStore from 'expo-secure-store';
import {
  Book,
  BookDetail,
  BookFilters,
  BookFormData,
  CategoryBooks,
  Comment,
} from '../types/book';
import { handleResponse, parseError } from './errorHandler';

const BASE_URL = 'http://192.168.1.14:3000/api/v1';
const TOKEN_KEY = 'auth_token';

/**
 * Convierte un coverUrl relativo en URL absoluta.
 * Si ya es absoluta (http/https) la devuelve tal cual.
 */
export function resolveCoverUrl(coverUrl: string | null | undefined): string | null {
  if (!coverUrl) return null;
  if (coverUrl.startsWith('http')) return coverUrl;
  // Ruta relativa como /api/v1/books/:id/cover
  return `http://192.168.1.14:3000${coverUrl}`;
}

async function authHeaders(): Promise<HeadersInit> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const bookService = {
  async getBooksByCategory(): Promise<CategoryBooks[]> {
    try {
      const headers = await authHeaders();
      const response = await fetch(`${BASE_URL}/books/by-category`, { headers });
      return handleResponse<CategoryBooks[]>(response);
    } catch (err) {
      throw parseError(err);
    }
  },

  async getBooks(filters?: BookFilters): Promise<Book[]> {
    try {
      const headers = await authHeaders();
      const params = new URLSearchParams();
      if (filters?.category) params.set('category', filters.category);
      if (filters?.year !== undefined) params.set('year', String(filters.year));
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`${BASE_URL}/books${query}`, { headers });
      return handleResponse<Book[]>(response);
    } catch (err) {
      throw parseError(err);
    }
  },

  async getBookById(id: string): Promise<BookDetail> {
    try {
      const headers = await authHeaders();
      const response = await fetch(`${BASE_URL}/books/${id}`, { headers });
      return handleResponse<BookDetail>(response);
    } catch (err) {
      throw parseError(err);
    }
  },

  async createBook(data: BookFormData): Promise<Book> {
    try {
      const headers = await authHeaders();
      const response = await fetch(`${BASE_URL}/books`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      return handleResponse<Book>(response);
    } catch (err) {
      throw parseError(err);
    }
  },

  async updateBook(id: string, data: BookFormData): Promise<Book> {
    try {
      const headers = await authHeaders();
      const response = await fetch(`${BASE_URL}/books/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });
      return handleResponse<Book>(response);
    } catch (err) {
      throw parseError(err);
    }
  },

  async deleteBook(id: string): Promise<void> {
    try {
      const headers = await authHeaders();
      const response = await fetch(`${BASE_URL}/books/${id}`, {
        method: 'DELETE',
        headers,
      });
      await handleResponse<void>(response);
    } catch (err) {
      throw parseError(err);
    }
  },

  async addComment(bookId: string, text: string): Promise<Comment> {
    try {
      const headers = await authHeaders();
      const response = await fetch(`${BASE_URL}/books/${bookId}/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ text }),
      });
      return handleResponse<Comment>(response);
    } catch (err) {
      throw parseError(err);
    }
  },

  async toggleFavorite(bookId: string): Promise<boolean> {
    try {
      const headers = await authHeaders();
      const response = await fetch(`${BASE_URL}/books/${bookId}/favorite`, {
        method: 'POST',
        headers,
      });
      const data = await handleResponse<{ isFavorite: boolean }>(response);
      return data.isFavorite;
    } catch (err) {
      throw parseError(err);
    }
  },

  async uploadCover(bookId: string, fileUri: string, fileName: string, mimeType: string): Promise<{ coverUrl: string }> {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const formData = new FormData();
      formData.append('cover', { uri: fileUri, name: fileName, type: mimeType } as any);
      const response = await fetch(`${BASE_URL}/books/${bookId}/cover`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      return handleResponse<{ coverUrl: string }>(response);
    } catch (err) {
      throw parseError(err);
    }
  },

  getCoverUrl(bookId: string): string {
    return `${BASE_URL}/books/${bookId}/cover`;
  },

  async uploadPdf(bookId: string, fileUri: string, fileName: string): Promise<{ hasPdf: boolean }> {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const formData = new FormData();
      formData.append('pdf', { uri: fileUri, name: fileName, type: 'application/pdf' } as any);
      const response = await fetch(`${BASE_URL}/books/${bookId}/pdf`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      return handleResponse<{ hasPdf: boolean }>(response);
    } catch (err) {
      throw parseError(err);
    }
  },

  getPdfUrl(bookId: string): string {
    return `${BASE_URL}/books/${bookId}/pdf`;
  },
};
