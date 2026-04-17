/**
 * Snapshot tests for FilterPanel component.
 * Validates: Requirements 6.1, 6.5
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import FilterPanel from '../FilterPanel';
import { BookFilters } from '../../types/book';

const categories = ['Fantasía', 'Romance', 'Policiaca'];
const years = [2020, 2021, 2022, 2023];

const defaultProps = {
  categories,
  years,
  selectedCategory: null,
  selectedYear: null,
  onApply: jest.fn(),
  onClear: jest.fn(),
  visible: true,
};

describe('FilterPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza correctamente cuando visible es true', () => {
    const { toJSON } = render(<FilterPanel {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('no renderiza nada cuando visible es false', () => {
    const { toJSON } = render(<FilterPanel {...defaultProps} visible={false} />);
    expect(toJSON()).toBeNull();
  });

  it('muestra el panel con testID filter-panel', () => {
    const { getByTestId } = render(<FilterPanel {...defaultProps} />);
    expect(getByTestId('filter-panel')).toBeTruthy();
  });

  it('muestra el dropdown de categoría', () => {
    const { getByTestId } = render(<FilterPanel {...defaultProps} />);
    expect(getByTestId('category-dropdown')).toBeTruthy();
  });

  it('muestra el dropdown de año', () => {
    const { getByTestId } = render(<FilterPanel {...defaultProps} />);
    expect(getByTestId('year-dropdown')).toBeTruthy();
  });

  it('abre la lista de categorías al presionar el dropdown', () => {
    const { getByTestId } = render(<FilterPanel {...defaultProps} />);
    fireEvent.press(getByTestId('category-dropdown'));
    expect(getByTestId('category-list')).toBeTruthy();
  });

  it('abre la lista de años al presionar el dropdown', () => {
    const { getByTestId } = render(<FilterPanel {...defaultProps} />);
    fireEvent.press(getByTestId('year-dropdown'));
    expect(getByTestId('year-list')).toBeTruthy();
  });

  it('llama onApply con los filtros seleccionados al presionar FILTRAR', () => {
    const onApply = jest.fn();
    const { getByTestId } = render(
      <FilterPanel {...defaultProps} onApply={onApply} />
    );

    // Seleccionar categoría
    fireEvent.press(getByTestId('category-dropdown'));
    fireEvent.press(getByTestId('category-option-Fantasía'));

    // Seleccionar año
    fireEvent.press(getByTestId('year-dropdown'));
    fireEvent.press(getByTestId('year-option-2022'));

    // Aplicar filtros
    fireEvent.press(getByTestId('apply-button'));

    expect(onApply).toHaveBeenCalledWith({ category: 'Fantasía', year: 2022 });
  });

  it('llama onApply con objeto vacío cuando no hay filtros seleccionados', () => {
    const onApply = jest.fn();
    const { getByTestId } = render(
      <FilterPanel {...defaultProps} onApply={onApply} />
    );
    fireEvent.press(getByTestId('apply-button'));
    expect(onApply).toHaveBeenCalledWith({});
  });

  it('llama onClear al presionar el botón Limpiar', () => {
    const onClear = jest.fn();
    const { getByTestId } = render(
      <FilterPanel {...defaultProps} onClear={onClear} />
    );
    fireEvent.press(getByTestId('clear-button'));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('renderiza con categoría y año preseleccionados', () => {
    const { toJSON } = render(
      <FilterPanel
        {...defaultProps}
        selectedCategory="Romance"
        selectedYear={2021}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
