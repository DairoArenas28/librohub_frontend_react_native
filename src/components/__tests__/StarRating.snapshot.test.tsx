/**
 * Snapshot tests for StarRating component.
 * Validates: Requirements 7.2
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StarRating from '../StarRating';

describe('StarRating', () => {
  it('renderiza correctamente en modo readonly con valor 3', () => {
    const { toJSON } = render(<StarRating value={3} readonly />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renderiza correctamente en modo editable con valor 4', () => {
    const { toJSON } = render(<StarRating value={4} onChange={jest.fn()} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('muestra estrellas rellenas hasta el valor indicado en readonly', () => {
    const { getByTestId } = render(<StarRating value={3} readonly />);
    expect(getByTestId('star-1').props.children).toBe('★');
    expect(getByTestId('star-3').props.children).toBe('★');
    expect(getByTestId('star-4').props.children).toBe('☆');
    expect(getByTestId('star-5').props.children).toBe('☆');
  });

  it('llama onChange con el valor correcto al presionar una estrella', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(<StarRating value={2} onChange={onChange} />);
    fireEvent.press(getByTestId('star-5'));
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('no llama onChange en modo readonly', () => {
    const onChange = jest.fn();
    // In readonly mode stars are Text, not TouchableOpacity — no press event
    const { queryAllByRole } = render(<StarRating value={3} readonly onChange={onChange} />);
    expect(queryAllByRole('button')).toHaveLength(0);
  });
});
