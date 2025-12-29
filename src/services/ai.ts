import { apiClient } from './api';

const CHAT_SESSION_KEY = 'himato_chat_session_id';

// Get session ID from localStorage (for guest users)
const getStoredSessionId = (): string | null => {
  try {
    return localStorage.getItem(CHAT_SESSION_KEY);
  } catch {
    return null;
  }
};

// Store session ID in localStorage (for guest users)
const storeSessionId = (sessionId: string | null): void => {
  try {
    if (sessionId) {
      localStorage.setItem(CHAT_SESSION_KEY, sessionId);
    } else {
      localStorage.removeItem(CHAT_SESSION_KEY);
    }
  } catch {
    // Ignore localStorage errors
  }
};

export const generateItinerary = async (prompt: string, isBusiness: boolean = false, businessName?: string) => {
  try {
    const response = await apiClient.generateItinerary({ 
      prompt, 
      isBusiness,
      ...(businessName && { businessName })
    });
    return response.data.itinerary;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to generate itinerary');
  }
};

export const chatWithSherpa = async (message: string, isAuthenticated: boolean = false): Promise<string> => {
  try {
    // For authenticated users, don't send sessionId (backend generates it from userId)
    // For guest users, send sessionId if we have one stored
    const sessionId = isAuthenticated ? undefined : getStoredSessionId() || undefined;
    
    const response = await apiClient.sendChatMessage({ 
      message, 
      sessionId
    });
    
    // Store session ID for guest users (authenticated users don't need it)
    if (response.data.sessionId && !isAuthenticated) {
      storeSessionId(response.data.sessionId);
    }
    
    return response.data.response;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send chat message');
  }
};

// Helper function to get session ID (for guest users)
export const getChatSessionId = (): string | null => {
  return getStoredSessionId();
};

// Helper function to set session ID (useful when restoring from storage)
export const setChatSessionId = (sessionId: string | null): void => {
  storeSessionId(sessionId);
};

// Clear chat session (for guest users)
export const clearChatSession = (): void => {
  storeSessionId(null);
};
