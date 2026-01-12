import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { apiClient } from '../services/api';
import type { LoginCredentials, RegisterData, AuthResponse } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  phoneNo: string;
  role: 'user' | 'admin';
  business: boolean;
  businessName?: string;
  isB2BVerified?: boolean;
  subscriptionStatus?: 'none' | 'pending' | 'active' | 'expired';
  subscriptionType?: 'none' | 'basic' | 'premium';
  subscriptionEndDate?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);

          // Optionally verify token with backend
          try {
            const currentUser = await apiClient.getCurrentUser();
            if (currentUser) {
              const u = currentUser as any;
              const mappedUser = u.data?.user || u.user || u;
              setUser(mappedUser);
              localStorage.setItem('user', JSON.stringify(mappedUser));
            }
          } catch (error) {
            // Token might be invalid, clear it
            console.error('Token validation failed:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const response: AuthResponse = await apiClient.login(credentials);

      // Handle new response format with nested data
      if (response.data && response.data.token && response.data.user) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user as User);
      }
      // Handle legacy format
      else if (response.token && response.user) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user as User);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      const response: AuthResponse = await apiClient.register(data);

      // Handle new response format with nested data and token (auto-login)
      if (response.data && response.data.token && response.data.user) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user as User);
      }
      // Handle new response format with user data but no token (registration only)
      else if (response.data && response.data.user) {
        // Registration successful but no auto-login token
        // User will need to log in separately
        // We don't set authToken or user here since there's no token
        return; // Success, but no auto-login
      }
      // Handle legacy format with token
      else if (response.token && response.user) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user as User);
      }
      // Handle legacy format with user only
      else if (response.user) {
        // Registration successful but no token
        return; // Success, but no auto-login
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state anyway
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response: any = await apiClient.getCurrentUser();
      const updatedUser = response.data?.user || response.user || response;
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

