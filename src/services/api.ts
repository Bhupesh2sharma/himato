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

export interface SignupExtras {
  asBusiness?: boolean;
  businessName?: string;
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

/** Trip intent a traveller shares after signing up (all optional). */
export interface TravelProfile {
  travelMonth?: string; // "2026-12" or "not-sure"
  groupSize?: string;   // "1", "2", "3-4", "5-8", "9+"
  whatsapp?: string;
  updatedAt?: string;
}

export interface GuidePost {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description?: string;
  category: string;
  image: string;
  imagePublicId?: string;
  content: string;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type PlaceCategory = 'monasteries' | 'lakes' | 'valleys' | 'treks';

export interface PopularPlace {
  _id: string;
  name: string;
  prompt: string;
  category: PlaceCategory;
  priority: number; // lower = shown first
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
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
    options: RequestInit = {},
    requireAuth: boolean = false
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
    } else if (requireAuth) {
      throw new Error('Authentication required');
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

  // Sign-up step 1: validates the details and emails a 6-digit code (no account yet).
  async register(data: RegisterData): Promise<{ status: string; data: { verificationRequired: boolean; email: string; resendIn: number } }> {
    return this.request('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Sign-up step 2: confirms the code, creates the account and returns a session.
  async verifyRegistration(email: string, otp: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/users/register/verify', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  async resendRegistrationCode(email: string): Promise<{ status: string; data: { email: string; resendIn: number } }> {
    return this.request('/api/users/register/resend', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // ── Google / phone sign-in ──
  // `extra` lets the agent app create agency accounts (asBusiness + businessName).
  async googleAuth(credential: string, extra: SignupExtras = {}): Promise<AuthResponse & { data: { isNewUser: boolean } }> {
    return this.request('/api/users/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential, ...extra }),
    });
  }

  async sendOtp(phone: string): Promise<{ status: string; data: { isNewUser: boolean; resendIn: number } }> {
    return this.request('/api/users/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  async verifyOtp(data: { phone: string; otp: string; name?: string } & SignupExtras): Promise<AuthResponse & { data: { isNewUser: boolean } }> {
    return this.request('/api/users/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMe(data: { name?: string; businessName?: string; business?: boolean; travelProfile?: TravelProfile }): Promise<{ status: string; data: { user: any } }> {
    return this.request('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, true);
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

  // Itinerary endpoints
  // Signed-out visitors get a preview (first days in full, later days locked).
  async generateItinerary(data: { prompt: string; isBusiness: boolean; businessName?: string; visitorId?: string; attribution?: { landingPage?: string; firstLandingPage?: string; referrer?: string } }): Promise<{ status: string; data: { itinerary: any; itineraryId?: string; preview?: boolean; previewDays?: number } }> {
    return this.request('/api/itinerary/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Refine an itinerary with a natural-language instruction (returns full updated plan)
  async editItinerary(data: { itineraryData: any; instruction: string }): Promise<{ status: string; data: { itinerary: any; note: string } }> {
    return this.request('/api/itinerary/edit', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async getItineraryHistory(page: number = 1, limit: number = 10, filter?: string): Promise<any> {
    const filterParam = filter && filter !== 'all' ? `&filter=${filter}` : '';
    return this.request(`/api/itinerary/history?page=${page}&limit=${limit}${filterParam}`, {
      method: 'GET',
    });
  }

  async getItineraryById(id: string): Promise<any> {
    return this.request(`/api/itinerary/${id}`, {
      method: 'GET',
    });
  }

  // Short public link (himato.in/<slug>) for an itinerary the user owns.
  // Sending itineraryData saves the on-screen version (e.g. after an AI tweak) first.
  async createShortLink(id: string, itineraryData?: any): Promise<{ status: string; data: { slug: string } }> {
    return this.request(`/api/itinerary/${id}/short-link`, {
      method: 'POST',
      body: JSON.stringify(itineraryData ? { itineraryData } : {}),
    }, true);
  }

  async getItineraryBySlug(slug: string): Promise<any> {
    return this.request(`/api/itinerary/slug/${slug}`, {
      method: 'GET',
    });
  }

  async deleteItinerary(id: string): Promise<void> {
    return this.request(`/api/itinerary/${id}`, {
      method: 'DELETE',
    });
  }

  async updateItinerary(id: string, data: { itineraryData?: any; prompt?: string; shared?: boolean; slug?: string; isOneTime?: boolean }): Promise<any> {
    return this.request(`/api/itinerary/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ── Proposal communication loop ──
  // Client-facing (by slug, no auth)
  async getSharedMessages(slug: string): Promise<{ status: string; data: { messages: any[] } }> {
    return this.request(`/api/itinerary/slug/${slug}/messages`);
  }

  async postClientMessage(slug: string, data: { body: string; dayRef?: number; clientName?: string }): Promise<{ status: string; data: { message: any } }> {
    return this.request(`/api/itinerary/slug/${slug}/message`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async acceptSharedItinerary(slug: string, data: { clientName?: string } = {}): Promise<{ status: string; data: { status: string } }> {
    return this.request(`/api/itinerary/slug/${slug}/accept`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ── Tourist → agent leads ──
  // Public: list registered agents a tourist can send an itinerary to.
  async getRegisteredAgents(): Promise<{ status: string; data: { agents: { _id: string; name: string; businessName: string }[] } }> {
    return this.request('/api/agents/registered');
  }

  // Public: tourist sends their itinerary to selected agents.
  // A quote request: lands in the Himato admin inbox; preferred agents are
  // only contacted once an admin approves it.
  async createLead(data: {
    agentIds: string[];
    touristName: string;
    touristPhone: string;
    touristEmail?: string;
    message?: string;
    itineraryData: any;
    attribution?: { landingPage?: string; firstLandingPage?: string; referrer?: string };
    visitorId?: string;
  }): Promise<{ status: string; data: { requestId: string; preferredCount: number; slug: string | null } }> {
    return this.request('/api/leads', { method: 'POST', body: JSON.stringify(data) });
  }

  // Popular place endpoints (public) — active places sorted by priority
  async getPopularPlaces(): Promise<{ status: string; data: { places: PopularPlace[] } }> {
    return this.request('/api/places');
  }

  // Guide endpoints (public)
  async getPublishedGuides(): Promise<{ status: string; data: { guides: GuidePost[] } }> {
    return this.request('/api/guides');
  }

  async getGuideBySlug(slug: string): Promise<{ status: string; data: { guide: GuidePost } }> {
    return this.request(`/api/guides/${slug}`);
  }

  // Chat endpoints
  async sendChatMessage(data: { message: string; sessionId?: string }): Promise<{ status: string; data: { response: string; sessionId: string; history: any[] } }> {
    return this.request('/api/chat/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getChatHistory(sessionId?: string, isAuthenticated: boolean = false): Promise<any> {
    // For authenticated users, don't send sessionId (backend uses userId from token)
    // For guest users, send sessionId as query parameter
    if (isAuthenticated) {
      return this.request('/api/chat/history', {
        method: 'GET',
      });
    } else {
      const query = sessionId ? `?sessionId=${sessionId}` : '';
      return this.request(`/api/chat/history${query}`, {
        method: 'GET',
      });
    }
  }

  async clearChatHistory(sessionId?: string, isAuthenticated: boolean = false): Promise<void> {
    // For authenticated users, send empty body (backend uses userId from token)
    // For guest users, send sessionId in body
    const body = isAuthenticated ? {} : { sessionId: sessionId || undefined };
    return this.request(`/api/chat/history`, {
      method: 'DELETE',
      body: JSON.stringify(body),
    });
  }

}

export const apiClient = new ApiClient();

