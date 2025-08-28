import { act } from 'react';
import { useAuthStore } from './authStore';

const mockUser = {
  id: '123',
  email: 'test@example.com',
  username: 'testuser',
  createdAt: new Date(),
  updatedAt: new Date(),
};
const mockToken = 'mock-jwt-token';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    act(() => {
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        token: null,
      });
    });
  });

  it('should initialize with default values', () => {
    const { user, isAuthenticated, token } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(isAuthenticated).toBe(false);
    expect(token).toBeNull();
  });

  it('should handle login correctly', () => {
    act(() => {
      useAuthStore.getState().login(mockUser, mockToken);
    });

    const { user, isAuthenticated, token } = useAuthStore.getState();
    expect(user).toEqual(mockUser);
    expect(isAuthenticated).toBe(true);
    expect(token).toBe(mockToken);
  });

  it('should handle logout correctly', () => {
    // First, log in a user
    act(() => {
      useAuthStore.getState().login(mockUser, mockToken);
    });

    // Then, log out
    act(() => {
      useAuthStore.getState().logout();
    });

    const { user, isAuthenticated, token } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(isAuthenticated).toBe(false);
    expect(token).toBeNull();
  });
});
