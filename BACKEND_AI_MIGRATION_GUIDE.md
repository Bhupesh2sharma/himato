# Backend AI Migration Guide - Complete Documentation

## Overview
This guide provides complete documentation for migrating AI communication logic from frontend to backend, implementing chat and itinerary history, and setting up the necessary APIs using Node.js, MongoDB, and Google Gemini AI.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Package Installation](#package-installation)
3. [Database Schema](#database-schema)
4. [Backend API Endpoints](#backend-api-endpoints)
5. [Backend Implementation](#backend-implementation)
6. [Model Recommendations](#model-recommendations)
7. [Frontend Updates](#frontend-updates)
8. [Environment Variables](#environment-variables)
9. [Error Handling](#error-handling)
10. [Testing](#testing)

---

## 1. Prerequisites

### Required Packages
```bash
npm install @google/generative-ai express mongoose cors dotenv jsonwebtoken bcryptjs
npm install --save-dev @types/express @types/node @types/cors @types/jsonwebtoken @types/bcryptjs typescript ts-node nodemon
```

### Required API Keys
- Google Gemini API Key (Get from [Google AI Studio](https://makersuite.google.com/app/apikey))
- MongoDB Connection String
- JWT Secret (for authentication)

---

## 2. Package Installation

### Initialize TypeScript (if not already done)
```bash
npm init -y
npm install typescript ts-node @types/node --save-dev
npx tsc --init
```

### Install Required Dependencies
```bash
# Core dependencies
npm install @google/generative-ai express mongoose cors dotenv jsonwebtoken bcryptjs

# Development dependencies
npm install --save-dev @types/express @types/mongoose @types/cors @types/jsonwebtoken @types/bcryptjs nodemon

# TypeScript setup
npm install --save-dev typescript ts-node @types/node
```

---

## 3. Database Schema

### MongoDB Collections Structure

#### **Users Collection** (if not already exists)
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  phoneNo: String,
  password: String (hashed),
  business: Boolean,
  businessName: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

#### **Itineraries Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to Users, optional for guests),
  prompt: String,
  itineraryData: {
    days: [{
      day: Number,
      title: String,
      activities: [{
        time: String,
        title: String,
        description: String,
        location: String
      }]
    }]
  },
  isBusiness: Boolean,
  businessName: String (optional),
  createdAt: Date,
  updatedAt: Date,
  shared: Boolean (default: false),
  shareId: String (unique, for sharing)
}
```

#### **ChatHistory Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to Users, optional for guests),
  sessionId: String (unique, for guest users),
  messages: [{
    role: String ('user' | 'model'),
    content: String,
    timestamp: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 4. Backend API Endpoints

### Authentication Endpoints (Already Implemented)
- `POST /api/users/login` - User login
- `POST /api/users/register` - User registration
- `GET /api/users/me` - Get current user

### New AI & History Endpoints

#### **Itinerary Generation**
```
POST /api/itinerary/generate
Headers: Authorization: Bearer <token> (optional)
Body: {
  prompt: string,
  isBusiness: boolean
}
Response: {
  status: "success",
  data: {
    itinerary: { days: [...] },
    itineraryId: string
  }
}
```

#### **Get User Itineraries**
```
GET /api/itinerary/history
Headers: Authorization: Bearer <token>
Query Params: ?page=1&limit=10
Response: {
  status: "success",
  data: {
    itineraries: [...],
    total: number,
    page: number,
    limit: number
  }
}
```

#### **Get Single Itinerary**
```
GET /api/itinerary/:id
Headers: Authorization: Bearer <token> (optional)
Response: {
  status: "success",
  data: {
    itinerary: {...}
  }
}
```

#### **Delete Itinerary**
```
DELETE /api/itinerary/:id
Headers: Authorization: Bearer <token>
Response: {
  status: "success",
  message: "Itinerary deleted successfully"
}
```

#### **Chat with Sherpa**
```
POST /api/chat/send
Headers: Authorization: Bearer <token> (optional)
Body: {
  message: string,
  sessionId?: string (for guest users)
}
Response: {
  status: "success",
  data: {
    response: string,
    sessionId: string,
    history: [...]
  }
}
```

#### **Get Chat History**
```
GET /api/chat/history
Headers: Authorization: Bearer <token> (optional)
Query Params: ?sessionId=<sessionId> (for guests)
Response: {
  status: "success",
  data: {
    messages: [...],
    sessionId: string
  }
}
```

#### **Clear Chat History**
```
DELETE /api/chat/history
Headers: Authorization: Bearer <token> (optional)
Body: {
  sessionId?: string (for guest users)
}
Response: {
  status: "success",
  message: "Chat history cleared"
}
```

---

## 5. Backend Implementation

### Project Structure
```
backend/
├── src/
│   ├── models/
│   │   ├── User.ts
│   │   ├── Itinerary.ts
│   │   └── ChatHistory.ts
│   ├── controllers/
│   │   ├── itineraryController.ts
│   │   └── chatController.ts
│   ├── services/
│   │   ├── aiService.ts
│   │   └── authService.ts
│   ├── routes/
│   │   ├── itineraryRoutes.ts
│   │   └── chatRoutes.ts
│   ├── middleware/
│   │   └── authMiddleware.ts
│   └── index.ts
├── .env
├── package.json
└── tsconfig.json
```

### Model Files

#### `src/models/Itinerary.ts`
```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IItinerary extends Document {
  userId?: mongoose.Types.ObjectId;
  prompt: string;
  itineraryData: {
    days: Array<{
      day: number;
      title: string;
      activities: Array<{
        time: string;
        title: string;
        description: string;
        location: string;
      }>;
    }>;
  };
  isBusiness: boolean;
  businessName?: string;
  createdAt: Date;
  updatedAt: Date;
  shared: boolean;
  shareId: string;
}

const ActivitySchema = new Schema({
  time: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true }
});

const DaySchema = new Schema({
  day: { type: Number, required: true },
  title: { type: String, required: true },
  activities: [ActivitySchema]
});

const ItinerarySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  prompt: { type: String, required: true },
  itineraryData: {
    days: [DaySchema]
  },
  isBusiness: { type: Boolean, default: false },
  businessName: { type: String, required: false },
  shared: { type: Boolean, default: false },
  shareId: { type: String, unique: true, sparse: true }
}, {
  timestamps: true
});

// Generate shareId before saving
ItinerarySchema.pre('save', function(next) {
  if (this.shared && !this.shareId) {
    this.shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

export const Itinerary = mongoose.model<IItinerary>('Itinerary', ItinerarySchema);
```

#### `src/models/ChatHistory.ts`
```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IChatHistory extends Document {
  userId?: mongoose.Types.ObjectId;
  sessionId: string;
  messages: Array<{
    role: 'user' | 'model';
    content: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema({
  role: { type: String, enum: ['user', 'model'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ChatHistorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  sessionId: { type: String, required: true, index: true },
  messages: [MessageSchema]
}, {
  timestamps: true
});

// Compound index for faster queries
ChatHistorySchema.index({ userId: 1, sessionId: 1 });
ChatHistorySchema.index({ sessionId: 1 });

export const ChatHistory = mongoose.model<IChatHistory>('ChatHistory', ChatHistorySchema);
```

### Service Files

#### `src/services/aiService.ts`
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

// Recommended Model: gemini-2.0-flash-exp or gemini-1.5-flash
// gemini-2.0-flash-exp: Latest, faster, better performance
// gemini-1.5-flash: Stable, reliable, good for production
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';

export class AIService {
  /**
   * Generate itinerary using Gemini AI
   */
  static async generateItinerary(prompt: string, isBusiness: boolean = false) {
    if (!API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

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
      console.error('AI Generation Error:', error);

      // Check for quota exceeded / rate limit errors
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        throw new Error('High traffic. Please wait 10-15 seconds before trying again.');
      }

      if (error.message && error.message.includes('Sikkim')) {
        throw error;
      }

      throw new Error('The mountains are not responding right now. Please try again shortly.');
    }
  }

  /**
   * Chat with Sherpa (Himato) using Gemini AI
   */
  static async chatWithSherpa(
    message: string,
    history: Array<{ role: 'user' | 'model'; content: string }>
  ) {
    if (!API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const systemMessage = {
      role: 'user' as const,
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

If a user asks about anything unrelated to Sikkim, politely steer them back to the magic of the Himalayas.`
      }]
    };

    const initialResponse = {
      role: 'model' as const,
      parts: [{
        text: "Namaste! I am Himato. My heart beats for the mountains of Sikkim! I'm here to reveal the stories, the legends, and the breathtaking magic of this land. Ask me, and I'll show you why Sikkim isn't just a place to see, but a place to *feel*."
      }]
    };

    // Prepare chat history
    const chatHistory = [
      systemMessage,
      initialResponse,
      ...history.map(msg => ({
        role: msg.role as 'user' | 'model',
        parts: [{ text: msg.content }]
      }))
    ];

    const chat = model.startChat({ history: chatHistory });

    try {
      const result = await chat.sendMessage(message);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('Sherpa Chat Error:', error);
      throw new Error('The connection to the Himalayas is weak right now. Please try again.');
    }
  }
}
```

### Controller Files

#### `src/controllers/itineraryController.ts`
```typescript
import { Request, Response } from 'express';
import { Itinerary, IItinerary } from '../models/Itinerary';
import { AIService } from '../services/aiService';
import { v4 as uuidv4 } from 'uuid';

interface AuthRequest extends Request {
  userId?: string;
}

export const generateItinerary = async (req: AuthRequest, res: Response) => {
  try {
    const { prompt, isBusiness } = req.body;
    const userId = req.userId || undefined;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Prompt is required'
      });
    }

    // Generate itinerary using AI
    const itineraryData = await AIService.generateItinerary(prompt, isBusiness || false);

    // Save to database
    const itinerary = new Itinerary({
      userId: userId || undefined,
      prompt,
      itineraryData,
      isBusiness: isBusiness || false,
      businessName: req.body.businessName || undefined,
      shared: false
    });

    await itinerary.save();

    res.status(200).json({
      status: 'success',
      data: {
        itinerary: itineraryData,
        itineraryId: itinerary._id.toString()
      }
    });
  } catch (error: any) {
    console.error('Generate Itinerary Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to generate itinerary'
    });
  }
};

export const getItineraryHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required to view history'
      });
    }

    const query = { userId };
    const itineraries = await Itinerary.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Itinerary.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        itineraries,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Get History Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch itinerary history'
    });
  }
};

export const getItineraryById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const itinerary = await Itinerary.findById(id);

    if (!itinerary) {
      return res.status(404).json({
        status: 'error',
        message: 'Itinerary not found'
      });
    }

    // Check if user has access (owner or shared)
    if (itinerary.userId && itinerary.userId.toString() !== userId && !itinerary.shared) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { itinerary }
    });
  } catch (error: any) {
    console.error('Get Itinerary Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch itinerary'
    });
  }
};

export const deleteItinerary = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const itinerary = await Itinerary.findById(id);

    if (!itinerary) {
      return res.status(404).json({
        status: 'error',
        message: 'Itinerary not found'
      });
    }

    // Check if user is owner
    if (itinerary.userId && itinerary.userId.toString() !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    await Itinerary.findByIdAndDelete(id);

    res.status(200).json({
      status: 'success',
      message: 'Itinerary deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete Itinerary Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete itinerary'
    });
  }
};
```

#### `src/controllers/chatController.ts`
```typescript
import { Request, Response } from 'express';
import { ChatHistory, IChatHistory } from '../models/ChatHistory';
import { AIService } from '../services/aiService';
import { v4 as uuidv4 } from 'uuid';

interface AuthRequest extends Request {
  userId?: string;
}

// Generate or get session ID
const getSessionId = (userId?: string): string => {
  if (userId) {
    return `user_${userId}`;
  }
  // For guests, generate a session ID
  return `guest_${uuidv4()}`;
};

export const sendChatMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.userId;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Message is required'
      });
    }

    // Get or create session ID
    const currentSessionId = sessionId || getSessionId(userId);

    // Get or create chat history
    let chatHistory = await ChatHistory.findOne({ 
      ...(userId ? { userId } : { sessionId: currentSessionId })
    });

    if (!chatHistory) {
      chatHistory = new ChatHistory({
        userId: userId || undefined,
        sessionId: currentSessionId,
        messages: []
      });
    }

    // Add user message
    chatHistory.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Prepare history for AI (last 10 messages for context)
    const recentHistory = chatHistory.messages.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Get AI response
    const aiResponse = await AIService.chatWithSherpa(message, recentHistory);

    // Add AI response
    chatHistory.messages.push({
      role: 'model',
      content: aiResponse,
      timestamp: new Date()
    });

    // Save to database
    await chatHistory.save();

    res.status(200).json({
      status: 'success',
      data: {
        response: aiResponse,
        sessionId: currentSessionId,
        history: chatHistory.messages
      }
    });
  } catch (error: any) {
    console.error('Chat Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to process chat message'
    });
  }
};

export const getChatHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { sessionId } = req.query;

    if (!userId && !sessionId) {
      return res.status(400).json({
        status: 'error',
        message: 'Session ID required for guest users'
      });
    }

    const query = userId 
      ? { userId } 
      : { sessionId: sessionId as string };

    const chatHistory = await ChatHistory.findOne(query);

    if (!chatHistory) {
      return res.status(200).json({
        status: 'success',
        data: {
          messages: [],
          sessionId: sessionId as string || getSessionId(userId)
        }
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        messages: chatHistory.messages,
        sessionId: chatHistory.sessionId
      }
    });
  } catch (error: any) {
    console.error('Get Chat History Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch chat history'
    });
  }
};

export const clearChatHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { sessionId } = req.body;

    if (!userId && !sessionId) {
      return res.status(400).json({
        status: 'error',
        message: 'Session ID required for guest users'
      });
    }

    const query = userId 
      ? { userId } 
      : { sessionId };

    await ChatHistory.findOneAndDelete(query);

    res.status(200).json({
      status: 'success',
      message: 'Chat history cleared'
    });
  } catch (error: any) {
    console.error('Clear Chat History Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to clear chat history'
    });
  }
};
```

### Route Files

#### `src/routes/itineraryRoutes.ts`
```typescript
import express from 'express';
import {
  generateItinerary,
  getItineraryHistory,
  getItineraryById,
  deleteItinerary
} from '../controllers/itineraryController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Generate itinerary (optional auth for guests)
router.post('/generate', authenticateToken, generateItinerary);

// Get user's itinerary history (requires auth)
router.get('/history', authenticateToken, getItineraryHistory);

// Get single itinerary by ID
router.get('/:id', authenticateToken, getItineraryById);

// Delete itinerary (requires auth)
router.delete('/:id', authenticateToken, deleteItinerary);

export default router;
```

#### `src/routes/chatRoutes.ts`
```typescript
import express from 'express';
import {
  sendChatMessage,
  getChatHistory,
  clearChatHistory
} from '../controllers/chatController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Send chat message (optional auth)
router.post('/send', authenticateToken, sendChatMessage);

// Get chat history
router.get('/history', authenticateToken, getChatHistory);

// Clear chat history
router.delete('/history', authenticateToken, clearChatHistory);

export default router;
```

### Middleware

#### `src/middleware/authMiddleware.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  userId?: string;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Make authentication optional - allow guest users
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as any;
      req.userId = decoded.id;
    } catch (error) {
      // Invalid token, but continue as guest
      req.userId = undefined;
    }
  }

  next();
};
```

### Main Server File

#### `src/index.ts`
```typescript
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import itineraryRoutes from './routes/itineraryRoutes';
import chatRoutes from './routes/chatRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel_planner';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 6. Model Recommendations

### Google Gemini Models Comparison

#### **Recommended: `gemini-2.0-flash-exp`**
- **Pros:** Latest model, fastest response time, better performance
- **Cons:** Experimental, may have occasional issues
- **Use Case:** Best for production if you want the latest features

#### **Stable Alternative: `gemini-1.5-flash`**
- **Pros:** Stable, reliable, well-tested
- **Cons:** Slightly slower than 2.0
- **Use Case:** Production environments requiring stability

#### **Other Options:**
- `gemini-1.5-pro`: For complex queries (slower, more expensive)
- `gemini-pro`: Legacy model (not recommended)

### Model Selection in Code
Set in `.env`:
```env
GEMINI_MODEL=gemini-2.0-flash-exp
# OR
GEMINI_MODEL=gemini-1.5-flash
```

---

## 7. Frontend Updates

### Update `src/services/api.ts`

Add new methods to the `ApiClient` class:

```typescript
// Add these interfaces
export interface ItineraryRequest {
  prompt: string;
  isBusiness: boolean;
  businessName?: string;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ItineraryResponse {
  status: string;
  data: {
    itinerary: any;
    itineraryId: string;
  };
}

export interface ChatResponse {
  status: string;
  data: {
    response: string;
    sessionId: string;
    history: Array<{
      role: 'user' | 'model';
      content: string;
      timestamp: string;
    }>;
  };
}

// Add these methods to ApiClient class
async generateItinerary(data: ItineraryRequest): Promise<ItineraryResponse> {
  return this.request<ItineraryResponse>('/api/itinerary/generate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async getItineraryHistory(page: number = 1, limit: number = 10): Promise<any> {
  return this.request(`/api/itinerary/history?page=${page}&limit=${limit}`, {
    method: 'GET',
  });
}

async getItineraryById(id: string): Promise<any> {
  return this.request(`/api/itinerary/${id}`, {
    method: 'GET',
  });
}

async deleteItinerary(id: string): Promise<void> {
  return this.request(`/api/itinerary/${id}`, {
    method: 'DELETE',
  });
}

async sendChatMessage(data: ChatRequest): Promise<ChatResponse> {
  return this.request<ChatResponse>('/api/chat/send', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async getChatHistory(sessionId?: string): Promise<any> {
  const query = sessionId ? `?sessionId=${sessionId}` : '';
  return this.request(`/api/chat/history${query}`, {
    method: 'GET',
  });
}

async clearChatHistory(sessionId?: string): Promise<void> {
  return this.request('/api/chat/history', {
    method: 'DELETE',
    body: JSON.stringify({ sessionId }),
  });
}
```

### Update `src/services/ai.ts`

Replace the existing functions to call backend:

```typescript
import { apiClient } from './api';

export const generateItinerary = async (prompt: string, isBusiness: boolean = false) => {
  try {
    const response = await apiClient.generateItinerary({ prompt, isBusiness });
    return response.data.itinerary;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to generate itinerary');
  }
};

export const chatWithSherpa = async (
  message: string,
  sessionId?: string
): Promise<string> => {
  try {
    const response = await apiClient.sendChatMessage({ message, sessionId });
    return response.data.response;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send chat message');
  }
};
```

---

## 8. Environment Variables

### Backend `.env` File
```env
# Server
PORT=3000
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb://localhost:27017/travel_planner
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/travel_planner

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Google Gemini AI
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp
# OR for stable: GEMINI_MODEL=gemini-1.5-flash
```

### Frontend `.env` (Update)
```env
# Backend API Base URL
VITE_API_BASE_URL=http://localhost:3000
# For production: VITE_API_BASE_URL=https://api.yourdomain.com

# Remove this - no longer needed in frontend
# VITE_API_KEY=...
```

---

## 9. Error Handling

### Rate Limiting
Add rate limiting middleware to prevent abuse:

```typescript
import rateLimit from 'express-rate-limit';

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: 'Too many requests, please try again later'
});

app.use('/api/itinerary/generate', aiLimiter);
app.use('/api/chat/send', aiLimiter);
```

### Error Responses Format
Always return consistent error format:
```json
{
  "status": "error",
  "message": "Error description"
}
```

---

## 10. Testing

### Test API Endpoints

#### Test Itinerary Generation
```bash
curl -X POST http://localhost:3000/api/itinerary/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "prompt": "7 days trip to North Sikkim",
    "isBusiness": false
  }'
```

#### Test Chat
```bash
curl -X POST http://localhost:3000/api/chat/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "Tell me about Gurudongmar Lake",
    "sessionId": "test_session_123"
  }'
```

---

## Summary

### Key Points:
1. ✅ Move AI logic to backend for security and better control
2. ✅ Save all itineraries and chat history in MongoDB
3. ✅ Support both authenticated users and guests
4. ✅ Use `gemini-2.0-flash-exp` or `gemini-1.5-flash` models
5. ✅ Implement proper error handling and rate limiting
6. ✅ Update frontend to call backend APIs instead of direct AI calls

### Next Steps:
1. Set up backend project structure
2. Install dependencies
3. Configure MongoDB and environment variables
4. Implement models and controllers
5. Test endpoints
6. Update frontend API calls
7. Deploy backend server

This migration will provide better security, user experience, and scalability for your travel planner application!


