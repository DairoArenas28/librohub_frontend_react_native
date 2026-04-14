/**
 * Snapshot tests for CommentItem component.
 * Validates: Requirements 7.7
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import CommentItem from '../CommentItem';
import { Comment } from '../../types/book';

const mockComment: Comment = {
  id: 'c1',
  userId: 'u1',
  authorName: 'Ana García',
  avatarUrl: 'https://example.com/avatar.jpg',
  text: 'Excelente libro, muy recomendado.',
  createdAt: '2024-01-01T00:00:00Z',
};

const mockCommentNoAvatar: Comment = {
  ...mockComment,
  id: 'c2',
  avatarUrl: undefined,
};

describe('CommentItem', () => {
  it('renderiza correctamente con avatar', () => {
    const { toJSON } = render(<CommentItem comment={mockComment} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renderiza correctamente sin avatar (usa placeholder)', () => {
    const { toJSON } = render(<CommentItem comment={mockCommentNoAvatar} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('muestra el nombre del autor', () => {
    const { getByTestId } = render(<CommentItem comment={mockComment} />);
    expect(getByTestId('comment-author').props.children).toBe('Ana García');
  });

  it('muestra el texto del comentario', () => {
    const { getByTestId } = render(<CommentItem comment={mockComment} />);
    expect(getByTestId('comment-text').props.children).toBe(mockComment.text);
  });
});
