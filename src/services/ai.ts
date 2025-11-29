import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_API_KEY;

export const generateItinerary = async (prompt: string, isBusiness: boolean = false) => {
  if (!API_KEY) {
    throw new Error("Missing API Key. Please add VITE_API_KEY to your .env file.");
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const toneInstruction = isBusiness
    ? "Use professional 'we' and 'our' language as if you are a premium travel agency planning this trip for a client."
    : "Use neutral, objective language. Do NOT use 'we', 'us', or 'our'. Describe the itinerary as a helpful, third-party planner.";

  const systemPrompt = `
    You are an expert travel planner for Sikkim, India.
    First, validate the user's request: "${prompt}".

    1. If the request is NOT about travel or tourism, OR if it is about a location strictly outside of Sikkim (e.g., "Plan a trip to Goa", "Recipe for momos"), return this EXACT JSON:
    {
      "error": "I specialize exclusively in Sikkim tourism. Please ask me to plan a trip within Sikkim!"
    }

    2. If the request IS valid (related to Sikkim travel), generate a detailed itinerary.
    ${toneInstruction}

    Strictly follow this JSON format for valid itineraries:
    {
      "days": [
        {
          "day": 1,
          "title": "Day Title",
          "activities": [
            {
              "time": "09:00 AM",
              "title": "Activity Name",
              "description": "Detailed description...",
              "location": "Location Name"
            }
          ]
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    // Clean up markdown code blocks if present
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonString);

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    if (error.message && error.message.includes("Sikkim")) {
      throw error;
    }
    throw new Error("Failed to generate itinerary. Please try again.");
  }
};
