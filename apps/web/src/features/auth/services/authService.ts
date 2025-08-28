import apiClient from '@/services/apiClient';
import { User } from '@/lib/types';

interface AuthResponse {
  message: string;
  user: Pick<User, 'id' | 'email' | 'username'>;
  token: string;
}

export const authServiceFrontend = {
  async register(email: string, password: string, username: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      email,
      password,
      username,
    });
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },
};
