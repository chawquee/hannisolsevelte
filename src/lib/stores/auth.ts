import { writable, derived, type Readable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'user';
  createdAt: string;
  lastLogin: string;
  permissions: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
}

// Initial auth state
const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  token: null,
  refreshToken: null,
  tokenExpiry: null
};

// Main auth store
export const authStore = writable<AuthState>(initialAuthState);

// Loading state for auth operations
export const authLoading = writable<boolean>(false);

// Derived stores
export const isAuthenticated: Readable<boolean> = derived(
  authStore,
  ($authStore) => $authStore.isAuthenticated
);

export const currentUser: Readable<User | null> = derived(
  authStore,
  ($authStore) => $authStore.user
);

export const isAdmin: Readable<boolean> = derived(
  authStore,
  ($authStore) => $authStore.user?.role === 'admin'
);

export const userPermissions: Readable<string[]> = derived(
  authStore,
  ($authStore) => $authStore.user?.permissions || []
);

// Token management
const TOKEN_KEY = 'hannisol_auth_token';
const REFRESH_TOKEN_KEY = 'hannisol_refresh_token';
const TOKEN_EXPIRY_KEY = 'hannisol_token_expiry';

// Utility functions
const storage = {
  get: (key: string): string | null => {
    if (!browser) return null;
    return localStorage.getItem(key);
  },
  set: (key: string, value: string): void => {
    if (!browser) return;
    localStorage.setItem(key, value);
  },
  remove: (key: string): void => {
    if (!browser) return;
    localStorage.removeItem(key);
  }
};

// Auth actions
export const authActions = {
  // Initialize auth state from stored tokens
  async init() {
    if (!browser) return;

    const token = storage.get(TOKEN_KEY);
    const refreshToken = storage.get(REFRESH_TOKEN_KEY);
    const tokenExpiry = storage.get(TOKEN_EXPIRY_KEY);

    if (token && tokenExpiry) {
      const expiry = parseInt(tokenExpiry);
      
      // Check if token is expired
      if (Date.now() < expiry) {
        authStore.update(state => ({
          ...state,
          token,
          refreshToken,
          tokenExpiry: expiry,
          isLoading: true
        }));

        // Verify token with server
        await this.verifyToken();
      } else if (refreshToken) {
        // Try to refresh the token
        await this.refreshTokens();
      } else {
        // Clear expired tokens
        this.clearTokens();
      }
    }
  },

  // Login with email and password
  async login(email: string, password: string, rememberMe: boolean = false) {
    authLoading.set(true);
    authStore.update(state => ({ ...state, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const { user, token, refreshToken, expiresIn } = data;
      const tokenExpiry = Date.now() + (expiresIn * 1000);

      // Store tokens
      storage.set(TOKEN_KEY, token);
      if (refreshToken) storage.set(REFRESH_TOKEN_KEY, refreshToken);
      storage.set(TOKEN_EXPIRY_KEY, tokenExpiry.toString());

      // Update auth state
      authStore.set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        token,
        refreshToken,
        tokenExpiry
      });

      // Set up auto-refresh
      this.scheduleTokenRefresh(expiresIn);

      return { success: true, user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      authStore.update(state => ({
        ...state,
        isLoading: false,
        error: errorMessage
      }));

      return { success: false, error: errorMessage };
    } finally {
      authLoading.set(false);
    }
  },

  // Logout
  async logout() {
    authLoading.set(true);

    try {
      // Notify server of logout
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${storage.get(TOKEN_KEY)}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }

    // Clear local state regardless of API response
    this.clearTokens();
    authStore.set(initialAuthState);
    authLoading.set(false);

    // Redirect to login page
    goto('/admin/login');
  },

  // Verify current token with server
  async verifyToken() {
    const token = storage.get(TOKEN_KEY);
    if (!token) {
      this.clearTokens();
      return false;
    }

    try {
      const response = await fetch('/api/admin/auth/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      const { user } = await response.json();
      
      authStore.update(state => ({
        ...state,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }));

      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      this.clearTokens();
      authStore.update(state => ({
        ...state,
        isLoading: false,
        error: 'Session expired'
      }));
      return false;
    }
  },

  // Refresh access token using refresh token
  async refreshTokens() {
    const refreshToken = storage.get(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      this.clearTokens();
      return false;
    }

    try {
      const response = await fetch('/api/admin/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const { token, refreshToken: newRefreshToken, expiresIn } = await response.json();
      const tokenExpiry = Date.now() + (expiresIn * 1000);

      // Update stored tokens
      storage.set(TOKEN_KEY, token);
      if (newRefreshToken) storage.set(REFRESH_TOKEN_KEY, newRefreshToken);
      storage.set(TOKEN_EXPIRY_KEY, tokenExpiry.toString());

      // Update auth state
      authStore.update(state => ({
        ...state,
        token,
        refreshToken: newRefreshToken || refreshToken,
        tokenExpiry,
        error: null
      }));

      // Schedule next refresh
      this.scheduleTokenRefresh(expiresIn);

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return false;
    }
  },

  // Schedule automatic token refresh
  scheduleTokenRefresh(expiresIn: number) {
    // Refresh token 5 minutes before expiry
    const refreshTime = (expiresIn - 300) * 1000;
    
    setTimeout(async () => {
      await this.refreshTokens();
    }, refreshTime);
  },

  // Clear all tokens and auth data
  clearTokens() {
    storage.remove(TOKEN_KEY);
    storage.remove(REFRESH_TOKEN_KEY);
    storage.remove(TOKEN_EXPIRY_KEY);
  },

  // Update user profile
  async updateProfile(profileData: Partial<User>) {
    authLoading.set(true);

    try {
      const response = await fetch('/api/admin/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${storage.get(TOKEN_KEY)}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error('Profile update failed');
      }

      const { user } = await response.json();

      authStore.update(state => ({
        ...state,
        user,
        error: null
      }));

      return { success: true, user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      
      authStore.update(state => ({
        ...state,
        error: errorMessage
      }));

      return { success: false, error: errorMessage };
    } finally {
      authLoading.set(false);
    }
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string) {
    authLoading.set(true);

    try {
      const response = await fetch('/api/admin/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${storage.get(TOKEN_KEY)}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Password change failed');
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password change failed';
      return { success: false, error: errorMessage };
    } finally {
      authLoading.set(false);
    }
  },

  // Check if user has specific permission
  hasPermission(permission: string): boolean {
    const state = authStore;
    let currentState: AuthState;
    
    state.subscribe(value => currentState = value)();
    
    return currentState.user?.permissions.includes(permission) || 
           currentState.user?.role === 'admin' || false;
  },

  // Clear error state
  clearError() {
    authStore.update(state => ({ ...state, error: null }));
  }
};

// Initialize auth on store creation
if (browser) {
  authActions.init();
}