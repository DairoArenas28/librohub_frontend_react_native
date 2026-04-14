/**
 * Snapshot tests for BookCard component.
 * Validates: Requirements 5.3, 5.4
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BookCard from '../BookCard';
import { Book } from '../../types/book';

const mockBook: Book = {
  id: 'book-1',
  title: 'El Señor de los Anillos',
  author: 'J.R.R. Tolkien',
  coverUrl: 'https://example.com/cover.jpg',
  category: 'Fantasía',
  year: 1954,
  status: 'active',
};

const mockBookNoCover: Book = {
  ...mockBook,
  id: 'book-2',
  coverUrl: '',
};

describe('BookCard', () => {
  it('renderiza correctamente con props mínimas', () => {
    const { toJSON } = render(<BookCard book={mockBook} onPress={jest.fn()} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renderiza correctamente sin portada (usa placeholder)', () => {
    const { toJSON } = render(<BookCard book={mockBookNoCover} onPress={jest.fn()} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('muestra el título del libro', () => {
    const { getByTestId } = render(<BookCard book={mockBook} onPress={jest.fn()} />);
    expect(getByTestId('book-title').props.children).toBe(mockBook.title);
  });

  it('llama onPress con el id del libro al presionar', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<BookCard book={mockBook} onPress={onPress} />);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledWith(mockBook.id);
  });
});
