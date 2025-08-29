import { useAuthStore } from '@/stores/authStore';

/**
 * Centralized authentication token management service
 * Provides secure token access and management for API calls
 */
class TokenService {
  /**
   * Get the current authentication token
   * Prioritizes Zustand store over localStorage for better security
   */
  getToken(): string | null {
    // First try to get token from Zustand store (preferred method)
    const authState = useAuthStore.getState();
    if (authState.token) {
      return authState.token;
    }

    // Fallback to localStorage for backward compatibility
    // This should eventually be phased out
    const fallbackToken = localStorage.getItem('supabase.auth.token');
    return fallbackToken || null;
  }

  /**
   * Get authentication headers for API requests
   */
  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    const baseHeaders = {
      'Content-Type': 'application/json',
    };

    if (token) {
      return {
        ...baseHeaders,
        'Authorization': `Bearer ${token}`,
      };
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
   * Store token in Zustand store and localStorage
   * @param token - The authentication token to store
   * @param user - The user object associated with the token
   */
  setToken(token: string, user: any): void {
    // Update Zustand store (primary storage)
    useAuthStore.getState().login(user, token);
    
    // Also update localStorage for backward compatibility
    // TODO: Remove this once all token access is centralized
    localStorage.setItem('supabase.auth.token', token);
  }

  /**
   * Clear token from both Zustand store and localStorage
   */
  clearToken(): void {
    // Clear from Zustand store
    useAuthStore.getState().logout();
    
    // Clear from localStorage
    localStorage.removeItem('supabase.auth.token');
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