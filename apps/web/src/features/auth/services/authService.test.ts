import apiClient from '@/services/apiClient';
import { authServiceFrontend } from './authService';

// Mock apiClient
jest.mock('@/services/apiClient', () => ({
  post: jest.fn(),
}));

describe('authServiceFrontend', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call the register API with correct data', async () => {
    const mockRegisterResponse = {
      message: 'Registration successful',
      user: { id: '1', email: 'test@example.com', username: 'testuser' },
      token: 'mock-token-register',
    };
    (apiClient.post as jest.Mock).mockResolvedValue({ data: mockRegisterResponse });

    const email = 'test@example.com';
    const password = 'password123';
    const username = 'testuser';

    const result = await authServiceFrontend.register(email, password, username);

    expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
      email,
      password,
      username,
    });
    expect(result).toEqual(mockRegisterResponse);
  });

  it('should call the login API with correct data', async () => {
    const mockLoginResponse = {
      message: 'Login successful',
      user: { id: '1', email: 'test@example.com', username: 'testuser' },
      token: 'mock-token-login',
    };
    (apiClient.post as jest.Mock).mockResolvedValue({ data: mockLoginResponse });

    const email = 'test@example.com';
    const password = 'password123';

    const result = await authServiceFrontend.login(email, password);

    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
      email,
      password,
    });
    expect(result).toEqual(mockLoginResponse);
  });

  it('should handle registration errors', async () => {
    const errorMessage = 'Registration failed';
    (apiClient.post as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const email = 'test@example.com';
    const password = 'password123';
    const username = 'testuser';

    await expect(authServiceFrontend.register(email, password, username)).rejects.toThrow(errorMessage);
  });

  it('should handle login errors', async () => {
    const errorMessage = 'Login failed';
    (apiClient.post as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const email = 'test@example.com';
    const password = 'password123';

    await expect(authServiceFrontend.login(email, password)).rejects.toThrow(errorMessage);
  });
});
