import { apiClient } from './api';

// Session ID storage for guest users
let chatSessionId: string | null = null;

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

export const chatWithSherpa = async (message: string): Promise<string> => {
  try {
    const response = await apiClient.sendChatMessage({ 
      message, 
      sessionId: chatSessionId || undefined 
    });
    
    // Store session ID for future requests
    if (response.data.sessionId && !chatSessionId) {
      chatSessionId = response.data.sessionId;
    }
    
    return response.data.response;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send chat message');
  }
};

// Helper function to get or create session ID
export const getChatSessionId = (): string | null => {
  return chatSessionId;
};

// Helper function to set session ID (useful when restoring from storage)
export const setChatSessionId = (sessionId: string | null): void => {
  chatSessionId = sessionId;
};
