import { renderHook, act } from '@testing-library/react-native';
import { useDashboard } from '../useDashboard';
import { userService } from '../../services/userService';
import { DashboardStats } from '../../types/user';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
}));

jest.mock('../../services/userService');

const mockGetDashboardStats = userService.getDashboardStats as jest.MockedFunction<
  typeof userService.getDashboardStats
>;

const mockStats: DashboardStats = {
  users: { active: 10, inactive: 3 },
  books: { active: 25, inactive: 5 },
};

describe('useDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts with isLoading true and no stats', () => {
    mockGetDashboardStats.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useDashboard());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.stats).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('sets stats and clears loading on success', async () => {
    mockGetDashboardStats.mockResolvedValue(mockStats);

    const { result } = renderHook(() => useDashboard());

    await act(async () => {});

    expect(result.current.isLoading).toBe(false);
    expect(result.current.stats).toEqual(mockStats);
    expect(result.current.error).toBeNull();
  });

  it('sets error and clears loading on failure', async () => {
    mockGetDashboardStats.mockRejectedValue(new TypeError('fetch failed'));

    const { result } = renderHook(() => useDashboard());

    await act(async () => {});

    expect(result.current.isLoading).toBe(false);
    expect(result.current.stats).toBeNull();
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.code).toBe('NETWORK_ERROR');
  });

  it('retry re-fetches stats successfully', async () => {
    mockGetDashboardStats
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce(mockStats);

    const { result } = renderHook(() => useDashboard());

    await act(async () => {});
    expect(result.current.error).not.toBeNull();

    await act(async () => {
      result.current.retry();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.stats).toEqual(mockStats);
    expect(result.current.error).toBeNull();
  });

  it('retry sets isLoading true while fetching', async () => {
    mockGetDashboardStats.mockResolvedValue(mockStats);

    const { result } = renderHook(() => useDashboard());
    await act(async () => {});

    let resolveRetry!: (v: DashboardStats) => void;
    mockGetDashboardStats.mockReturnValue(
      new Promise<DashboardStats>((res) => { resolveRetry = res; }),
    );

    act(() => {
      result.current.retry();
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveRetry(mockStats);
    });

    expect(result.current.isLoading).toBe(false);
  });
});
