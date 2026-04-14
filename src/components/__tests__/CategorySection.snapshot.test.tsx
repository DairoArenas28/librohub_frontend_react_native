/**
 * Snapshot tests for CategorySection component.
 * Validates: Requirements 5.3, 5.4
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import CategorySection from '../CategorySection';
import { Book } from '../../types/book';

const mockBooks: Book[] = [
  {
    id: 'book-1',
    title: 'Dune',
    author: 'Frank Herbert',
    coverUrl: 'https://example.com/dune.jpg',
    category: 'Ciencia Ficción',
    year: 1965,
    status: 'active',
  },
  {
    id: 'book-2',
    title: 'Fundación',
    author: 'Isaac Asimov',
    coverUrl: 'https://example.com/foundation.jpg',
    category: 'Ciencia Ficción',
    year: 1951,
    status: 'active',
  },
];

describe('CategorySection', () => {
  it('renderiza correctamente con props mínimas', () => {
    const { toJSON } = render(
      <CategorySection
        category="Ciencia Ficción"
        books={mockBooks}
        onBookPress={jest.fn()}
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('renderiza correctamente con lista vacía de libros', () => {
    const { toJSON } = render(
      <CategorySection category="Fantasía" books={[]} onBookPress={jest.fn()} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('muestra el nombre de la categoría', () => {
    const { getByTestId } = render(
      <CategorySection
        category="Romance"
        books={mockBooks}
        onBookPress={jest.fn()}
      />,
    );
    expect(getByTestId('category-name').props.children).toBe('Romance');
  });
});
