import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { apiClient } from '../services/api';
import type { LoginCredentials, RegisterData, AuthResponse, SignupExtras, TravelProfile } from '../services/api';
import { track } from '../utils/analytics';

interface User {
  id: string;
  name: string;
  email: string;
  phoneNo: string;
  role: 'user' | 'admin';
  business: boolean;
  businessName?: string;
  isAdmin?: boolean;
  avatar?: string;
  phoneVerified?: boolean;
  subscriptionStatus?: 'active' | 'inactive' | 'cancelled' | string;
  travelProfile?: TravelProfile;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterData) => Promise<{ email: string; resendIn: number }>;
  verifyRegistration: (email: string, otp: string) => Promise<User>;
  loginWithGoogle: (credential: string, extra?: SignupExtras) => Promise<User>;
  verifyPhoneOtp: (data: { phone: string; otp: string; name?: string } & SignupExtras) => Promise<User>;
  updateProfile: (data: { name?: string; businessName?: string; business?: boolean; travelProfile?: TravelProfile }) => Promise<User>;
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
        return response.data.user as User;
      }
      // Handle legacy format
      else if (response.token && response.user) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user as User);
        return response.user as User;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      throw error;
    }
  }, []);

  // Store a session returned by Google / OTP sign-in.
  const startSession = useCallback((response: AuthResponse): User => {
    if (!response.data?.token || !response.data?.user) {
      throw new Error('Invalid response from server');
    }
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    setUser(response.data.user as User);
    return response.data.user as User;
  }, []);

  const loginWithGoogle = useCallback(async (credential: string, extra: SignupExtras = {}) => {
    const res = await apiClient.googleAuth(credential, extra);
    track(res.data?.isNewUser ? 'signup_completed' : 'login_completed', { method: 'google' });
    return startSession(res);
  }, [startSession]);

  const verifyPhoneOtp = useCallback(async (data: { phone: string; otp: string; name?: string } & SignupExtras) => {
    const res = await apiClient.verifyOtp(data);
    track(res.data?.isNewUser ? 'signup_completed' : 'login_completed', { method: 'phone' });
    return startSession(res);
  }, [startSession]);

  const updateProfile = useCallback(async (data: { name?: string; businessName?: string; business?: boolean; travelProfile?: TravelProfile }) => {
    const res = await apiClient.updateMe(data);
    const updated = res.data.user as User;
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
    return updated;
  }, []);

  // Sign-up: emails a verification code; the account is created by verifyRegistration.
  const register = useCallback(async (data: RegisterData) => {
    const response = await apiClient.register(data);
    return { email: response.data.email, resendIn: response.data.resendIn };
  }, []);

  const verifyRegistration = useCallback(async (email: string, otp: string) => {
    return startSession(await apiClient.verifyRegistration(email, otp));
  }, [startSession]);

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
    verifyRegistration,
    loginWithGoogle,
    verifyPhoneOtp,
    updateProfile,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

