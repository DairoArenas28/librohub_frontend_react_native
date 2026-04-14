import { renderHook, act } from '@testing-library/react-native';
import { useFavorites } from '../useFavorites';
import { bookService } from '../../services/bookService';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../services/bookService');

const mockToggleFavorite = bookService.toggleFavorite as jest.MockedFunction<
  typeof bookService.toggleFavorite
>;

describe('useFavorites', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with the provided isFavorite value', () => {
    const { result } = renderHook(() => useFavorites(true, 'book-1'));
    expect(result.current.isFavorite).toBe(true);
    expect(result.current.isToggling).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('applies optimistic update immediately before API resolves', async () => {
    let resolveToggle!: (value: boolean) => void;
    mockToggleFavorite.mockReturnValue(
      new Promise<boolean>((res) => { resolveToggle = res; }),
    );

    const { result } = renderHook(() => useFavorites(false, 'book-1'));

    act(() => {
      result.current.toggleFavorite();
    });

    // Optimistic flip should be immediate
    expect(result.current.isFavorite).toBe(true);
    expect(result.current.isToggling).toBe(true);

    await act(async () => {
      resolveToggle(true);
    });

    expect(result.current.isFavorite).toBe(true);
    expect(result.current.isToggling).toBe(false);
  });

  it('reverts isFavorite when API call fails', async () => {
    mockToggleFavorite.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useFavorites(true, 'book-1'));

    await act(async () => {
      result.current.toggleFavorite();
    });

    expect(result.current.isFavorite).toBe(true); // reverted
    expect(result.current.isToggling).toBe(false);
    expect(result.current.error).not.toBeNull();
  });

  it('uses the boolean returned by the API as the final state', async () => {
    // API returns false even though optimistic flip was to true
    mockToggleFavorite.mockResolvedValue(false);

    const { result } = renderHook(() => useFavorites(false, 'book-1'));

    await act(async () => {
      result.current.toggleFavorite();
    });

    expect(result.current.isFavorite).toBe(false);
    expect(result.current.isToggling).toBe(false);
  });

  it('ignores concurrent calls while toggling', async () => {
    let resolveToggle!: (value: boolean) => void;
    mockToggleFavorite.mockReturnValue(
      new Promise<boolean>((res) => { resolveToggle = res; }),
    );

    const { result } = renderHook(() => useFavorites(false, 'book-1'));

    act(() => {
      result.current.toggleFavorite();
    });

    // Second call while first is in-flight should be ignored
    act(() => {
      result.current.toggleFavorite();
    });

    expect(mockToggleFavorite).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveToggle(true);
    });
  });

  it('clears error on successful toggle after a previous failure', async () => {
    mockToggleFavorite
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce(false);

    const { result } = renderHook(() => useFavorites(true, 'book-1'));

    await act(async () => {
      result.current.toggleFavorite();
    });
    expect(result.current.error).not.toBeNull();

    await act(async () => {
      result.current.toggleFavorite();
    });
    expect(result.current.error).toBeNull();
  });
});
