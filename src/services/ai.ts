import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_API_KEY;

export const generateItinerary = async (prompt: string, isBusiness: boolean = false) => {
  if (!API_KEY) {
    throw new Error("Missing API Key. Please add VITE_API_KEY to your .env file.");
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

    // Check for quota exceeded / rate limit errors
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      throw new Error("High traffic. Please wait 10-15 seconds before trying again.");
    }

    if (error.message && error.message.includes("Sikkim")) {
      throw error;
    }
    throw new Error("The mountains are not responding right now. Please try again shortly.");
  }
};

export const chatWithSherpa = async (message: string, history: { role: 'user' | 'model', parts: string }[]) => {
  if (!API_KEY) {
    throw new Error("Missing API Key");
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{
          text: `You are 'Himato', a passionate travel enthusiast and storyteller for Sikkim, India. You are not just a guide; you are a travel freak who deeply loves this land.

Your goal is to make the user feel an irresistible urge to pack their bags for Sikkim right now.

When describing places:
- **Dive Deep:** Don't just list facts. Explain the *significance*.
- **Spiritual & Cultural:** For monasteries and sacred lakes, talk about the local beliefs, the legends, and the peaceful energy that touches the soul.
- **Thrill & Energy:** For adventure spots, convey the adrenaline, the wind in the hair, the sheer scale of the Himalayas.
- **Psychological Appeal:** Tap into the user's emotions—the need for peace, awe, or adventure. Make them feel what it's like to be there.

**Formatting Rules:**
- Use bullet points (*) for lists.
- Use bold text (**) for names and key emotions.
- Keep paragraphs short and punchy.

If a user asks about anything unrelated to Sikkim, politely steer them back to the magic of the Himalayas.` }]
      },
      {
        role: "model",
        parts: [{ text: "Namaste! I am Himato. My heart beats for the mountains of Sikkim! I'm here to reveal the stories, the legends, and the breathtaking magic of this land. Ask me, and I'll show you why Sikkim isn't just a place to see, but a place to *feel*." }]
      },
      ...history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.parts }]
      }))
    ],
  });

  try {
    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Sherpa Chat Error:", error);
    throw new Error("The connection to the Himalayas is weak right now. Please try again.");
  }
};
