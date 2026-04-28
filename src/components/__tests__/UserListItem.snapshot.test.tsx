/**
 * Snapshot tests for UserListItem component.
 * Validates: Requirements 10.2, 10.4
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import UserListItem from '../UserListItem';
import { User } from '../../types/user';

const mockUser: User = {
  id: 'user-1',
  name: 'Ana García',
  document: '12345678',
  email: 'ana@example.com',
  phone: '3001234567',
  role: 'reader',
  isActive: true,
  hasAvatar: false,
  avatarBase64: null,
};

describe('UserListItem', () => {
  it('renderiza correctamente con props mínimas', () => {
    const { toJSON } = render(
      <UserListItem user={mockUser} onUpdate={jest.fn()} onDelete={jest.fn()} />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('muestra nombre, documento, teléfono y correo', () => {
    const { getByTestId, getByText } = render(
      <UserListItem user={mockUser} onUpdate={jest.fn()} onDelete={jest.fn()} />
    );
    expect(getByTestId('user-list-item')).toBeTruthy();
    expect(getByText(mockUser.name)).toBeTruthy();
    expect(getByText(`Doc: ${mockUser.document}`)).toBeTruthy();
    expect(getByText(`Tel: ${mockUser.phone}`)).toBeTruthy();
    expect(getByText(mockUser.email)).toBeTruthy();
  });

  it('llama onUpdate con el id del usuario al presionar Actualizar', () => {
    const onUpdate = jest.fn();
    const { getByTestId } = render(
      <UserListItem user={mockUser} onUpdate={onUpdate} onDelete={jest.fn()} />
    );
    fireEvent.press(getByTestId('user-update-button'));
    expect(onUpdate).toHaveBeenCalledWith(mockUser.id);
  });

  it('llama onDelete con el id del usuario al presionar Eliminar', () => {
    const onDelete = jest.fn();
    const { getByTestId } = render(
      <UserListItem user={mockUser} onUpdate={jest.fn()} onDelete={onDelete} />
    );
    fireEvent.press(getByTestId('user-delete-button'));
    expect(onDelete).toHaveBeenCalledWith(mockUser.id);
  });
});
