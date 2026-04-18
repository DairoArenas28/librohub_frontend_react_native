export type BookStatus = 'active' | 'coming_soon';

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  category: string;
  year: number;
  status: BookStatus;
  hasPdf?: boolean;
}

export interface BookDetail extends Book {
  pages: number;
  language: string;
  isbn: string;
  publisher: string;
  synopsis: string;
  rating: number;
  categories: string[];
  comments: Comment[];
  isFavorite: boolean;
  hasPdf: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  authorName: string;
  avatarUrl?: string;
  text: string;
  createdAt: string;
}

export interface CategoryBooks {
  category: string;
  books: Book[];
}

export interface BookFilters {
  category?: string;
  year?: number;
  search?: string;
}

export interface BookFormData {
  title: string;
  author: string;
  coverUrl?: string;
  year: number;
  pages: number;
  language: string;
  isbn: string;
  publisher: string;
  synopsis: string;
  categories: string[];
  status: BookStatus;
}
