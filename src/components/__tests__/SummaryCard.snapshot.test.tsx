/**
 * Snapshot tests for SummaryCard component.
 * Validates: Requirements 9.2, 9.3, 9.7
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SummaryCard from '../SummaryCard';

describe('SummaryCard', () => {
  it('renderiza correctamente con conteos', () => {
    const { toJSON } = render(
      <SummaryCard title="Usuarios" activeCount={10} inactiveCount={3} isLoading={false} onPress={jest.fn()} />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('renderiza correctamente en estado de carga', () => {
    const { toJSON } = render(
      <SummaryCard title="Libros" activeCount={0} inactiveCount={0} isLoading={true} onPress={jest.fn()} />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('muestra el título', () => {
    const { getByTestId } = render(
      <SummaryCard title="Usuarios" activeCount={5} inactiveCount={2} isLoading={false} onPress={jest.fn()} />
    );
    expect(getByTestId('summary-card-title').props.children).toBe('Usuarios');
  });

  it('muestra conteo activos e inactivos cuando no está cargando', () => {
    const { getByTestId } = render(
      <SummaryCard title="Usuarios" activeCount={8} inactiveCount={4} isLoading={false} onPress={jest.fn()} />
    );
    expect(getByTestId('summary-card-active').props.children).toBe(8);
    expect(getByTestId('summary-card-inactive').props.children).toBe(4);
  });

  it('muestra ActivityIndicator cuando isLoading es true', () => {
    const { getByTestId, queryByTestId } = render(
      <SummaryCard title="Usuarios" activeCount={0} inactiveCount={0} isLoading={true} onPress={jest.fn()} />
    );
    expect(getByTestId('summary-card-loading')).toBeTruthy();
    expect(queryByTestId('summary-card-active')).toBeNull();
    expect(queryByTestId('summary-card-inactive')).toBeNull();
  });

  it('llama onPress al presionar la tarjeta', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <SummaryCard title="Usuarios" activeCount={5} inactiveCount={2} isLoading={false} onPress={onPress} />
    );
    fireEvent.press(getByTestId('summary-card'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
