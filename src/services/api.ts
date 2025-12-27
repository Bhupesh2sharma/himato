const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phoneNo: string;
  password: string;
  acceptTermsAndConditions: boolean;
  business: boolean;
  businessName: string;
}

export interface AuthResponse {
  status?: string;
  message?: string;
  data?: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      phoneNo: string;
      business: boolean;
      businessName?: string;
      createdAt?: string;
    };
  };
  // Legacy format support
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phoneNo: string;
    business: boolean;
    businessName?: string;
  };
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * API Client for making HTTP requests to the backend
 */
class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.baseURL) {
      throw new Error('API base URL is not configured. Please set VITE_API_BASE_URL in your .env file.');
    }
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          response.status,
          data.message || `API Error: ${response.statusText}`
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<AuthResponse['user']> {
    return this.request<AuthResponse['user']>('/api/users/me', {
      method: 'GET',
    });
  }

  async logout(): Promise<void> {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
}

export const apiClient = new ApiClient();

