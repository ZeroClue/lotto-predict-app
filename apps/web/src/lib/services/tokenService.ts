import { useAuthStore } from '@/stores/authStore';

/**
 * Centralized authentication token management service
 * Provides secure token access and management for API calls
 */
class TokenService {
  /**
   * Get the current authentication token
   * Gets token from Zustand store (primary method)
   */
  getToken(): string | null {
    // Get token from Zustand store
    const authState = useAuthStore.getState();
    return authState.token;
  }

  /**
   * Get authentication headers for API requests
   * @param requireAuth - If true, throws error when no token is available
   */
  getAuthHeaders(requireAuth: boolean = false): Record<string, string> {
    const token = this.getToken();
    const authState = useAuthStore.getState();
    
    const baseHeaders = {
      'Content-Type': 'application/json',
    };

    if (token) {
      return {
        ...baseHeaders,
        'Authorization': `Bearer ${token}`,
      };
    }

    if (requireAuth) {
      console.error('Authentication required but no token found. Auth state:', {
        isAuthenticated: authState.isAuthenticated,
        hasUser: !!authState.user,
        hasToken: !!authState.token
      });
      throw new Error('Authentication required - no token found');
    }

    return baseHeaders;
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated(): boolean {
    const authState = useAuthStore.getState();
    return authState.isAuthenticated && !!this.getToken();
  }

  /**
   * Store token in Zustand store
   * @param token - The authentication token to store
   * @param user - The user object associated with the token
   */
  setToken(token: string, user: any): void {
    // Update Zustand store (primary storage)
    useAuthStore.getState().login(user, token);
  }

  /**
   * Clear token from Zustand store
   */
  clearToken(): void {
    // Clear from Zustand store
    useAuthStore.getState().logout();
  }

  /**
   * Refresh token if needed (placeholder for future implementation)
   * @returns Promise that resolves when token is refreshed
   */
  async refreshToken(): Promise<void> {
    // TODO: Implement token refresh logic with Supabase
    // This would involve calling Supabase refresh token endpoint
    // and updating both stores with the new token
    console.warn('Token refresh not yet implemented');
  }
}

// Export singleton instance
export const tokenService = new TokenService();