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
    ${toneInstruction}
    Generate a detailed itinerary based on this request: "${prompt}".

    Strictly follow this JSON format:
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
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate itinerary. Please try again.");
  }
};
