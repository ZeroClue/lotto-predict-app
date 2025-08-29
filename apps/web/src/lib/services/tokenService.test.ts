import { tokenService } from './tokenService';
import { useAuthStore } from '@/stores/authStore';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock useAuthStore
jest.mock('@/stores/authStore', () => ({
  useAuthStore: {
    getState: jest.fn(),
  },
}));

describe('TokenService', () => {
  const mockUser = {
    id: 'user1',
    email: 'test@example.com',
    username: 'testuser',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockToken = 'mock-jwt-token';

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  describe('getToken', () => {
    it('should return token from auth store when available', () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({
        token: mockToken,
        user: mockUser,
        isAuthenticated: true,
      });

      const result = tokenService.getToken();

      expect(result).toBe(mockToken);
    });

    it('should fallback to localStorage when auth store token is null', () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({
        token: null,
        user: null,
        isAuthenticated: false,
      });

      localStorageMock.getItem.mockReturnValue(mockToken);

      const result = tokenService.getToken();

      expect(result).toBe(mockToken);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('supabase.auth.token');
    });

    it('should return null when no token is available', () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({
        token: null,
        user: null,
        isAuthenticated: false,
      });

      localStorageMock.getItem.mockReturnValue(null);

      const result = tokenService.getToken();

      expect(result).toBeNull();
    });
  });

  describe('getAuthHeaders', () => {
    it('should return headers with Authorization when token exists', () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({
        token: mockToken,
        user: mockUser,
        isAuthenticated: true,
      });

      const result = tokenService.getAuthHeaders();

      expect(result).toEqual({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`,
      });
    });

    it('should return base headers when no token exists', () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({
        token: null,
        user: null,
        isAuthenticated: false,
      });

      localStorageMock.getItem.mockReturnValue(null);

      const result = tokenService.getAuthHeaders();

      expect(result).toEqual({
        'Content-Type': 'application/json',
      });
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is authenticated and has token', () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({
        token: mockToken,
        user: mockUser,
        isAuthenticated: true,
      });

      const result = tokenService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when user is not authenticated', () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({
        token: null,
        user: null,
        isAuthenticated: false,
      });

      localStorageMock.getItem.mockReturnValue(null);

      const result = tokenService.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false when authenticated but no token', () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({
        token: null,
        user: mockUser,
        isAuthenticated: true,
      });

      localStorageMock.getItem.mockReturnValue(null);

      const result = tokenService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('setToken', () => {
    it('should update auth store and localStorage', () => {
      const mockLogin = jest.fn();
      (useAuthStore.getState as jest.Mock).mockReturnValue({
        login: mockLogin,
      });

      tokenService.setToken(mockToken, mockUser);

      expect(mockLogin).toHaveBeenCalledWith(mockUser, mockToken);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('supabase.auth.token', mockToken);
    });
  });

  describe('clearToken', () => {
    it('should clear token from auth store and localStorage', () => {
      const mockLogout = jest.fn();
      (useAuthStore.getState as jest.Mock).mockReturnValue({
        logout: mockLogout,
      });

      tokenService.clearToken();

      expect(mockLogout).toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('supabase.auth.token');
    });
  });

  describe('refreshToken', () => {
    it('should log warning for unimplemented functionality', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      await tokenService.refreshToken();

      expect(consoleSpy).toHaveBeenCalledWith('Token refresh not yet implemented');
      
      consoleSpy.mockRestore();
    });
  });
});