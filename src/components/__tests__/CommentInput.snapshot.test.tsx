/**
 * Snapshot tests for CommentInput component.
 * Validates: Requirements 7.8, 7.11
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CommentInput from '../CommentInput';

describe('CommentInput', () => {
  it('renderiza correctamente en estado inicial', () => {
    const { toJSON } = render(<CommentInput onSubmit={jest.fn()} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renderiza correctamente en estado de carga', () => {
    const { toJSON } = render(<CommentInput onSubmit={jest.fn()} isLoading />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('llama onSubmit con el texto al presionar enviar', () => {
    const onSubmit = jest.fn();
    const { getByTestId } = render(<CommentInput onSubmit={onSubmit} />);
    fireEvent.changeText(getByTestId('comment-input-field'), 'Gran libro!');
    fireEvent.press(getByTestId('comment-submit-button'));
    expect(onSubmit).toHaveBeenCalledWith('Gran libro!');
  });

  it('muestra error si se intenta enviar comentario vacío', () => {
    const onSubmit = jest.fn();
    const { getByTestId } = render(<CommentInput onSubmit={onSubmit} />);
    fireEvent.press(getByTestId('comment-submit-button'));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(getByTestId('comment-error').props.children).toBe(
      'El comentario no puede estar vacío'
    );
  });

  it('muestra error si el texto es solo espacios en blanco', () => {
    const onSubmit = jest.fn();
    const { getByTestId } = render(<CommentInput onSubmit={onSubmit} />);
    fireEvent.changeText(getByTestId('comment-input-field'), '   ');
    fireEvent.press(getByTestId('comment-submit-button'));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(getByTestId('comment-error').props.children).toBe(
      'El comentario no puede estar vacío'
    );
  });

  it('limpia el campo tras envío exitoso', () => {
    const onSubmit = jest.fn();
    const { getByTestId } = render(<CommentInput onSubmit={onSubmit} />);
    fireEvent.changeText(getByTestId('comment-input-field'), 'Buen libro');
    fireEvent.press(getByTestId('comment-submit-button'));
    expect(getByTestId('comment-input-field').props.value).toBe('');
  });
});
