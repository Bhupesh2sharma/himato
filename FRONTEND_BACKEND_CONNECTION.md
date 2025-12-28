# Frontend-Backend Connection Guide

## ✅ Frontend Updates Completed

All frontend code has been updated to connect to your backend API. Here's what was changed:

### 1. **API Service** (`src/services/api.ts`)
- ✅ Added itinerary endpoints: `generateItinerary`, `getItineraryHistory`, `getItineraryById`, `deleteItinerary`
- ✅ Added chat endpoints: `sendChatMessage`, `getChatHistory`, `clearChatHistory`
- ✅ Updated to handle optional authentication (guest users)
- ✅ Fixed response types to handle optional `itineraryId` (for guest users)

### 2. **AI Service** (`src/services/ai.ts`)
- ✅ Updated `generateItinerary` to call backend API instead of direct Gemini calls
- ✅ Updated `chatWithSherpa` to call backend API with session management
- ✅ Added session ID management for guest users

### 3. **Components Updated**
- ✅ **Hero Component**: Now passes `businessName` if user is a business user
- ✅ **SikkimSherpa Component**: 
  - Loads chat history on mount
  - Manages session IDs for persistence
  - Handles both authenticated and guest users
- ✅ **App.tsx**: Updated to pass `businessName` through the chain

---

## 🔧 Configuration Required

### 1. Update `.env` File

Create or update your `.env` file in the project root:

```env
# Backend API Base URL (UPDATE THIS!)
VITE_API_BASE_URL=http://localhost:8080

# Remove this line - no longer needed (API key is on backend)
# VITE_API_KEY=...
```

**⚠️ Important:** Make sure the port matches your backend server (8080 based on your Postman guide).

### 2. Restart Development Server

After updating `.env`, restart your Vite dev server:

```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## 🧪 Testing the Connection

### Test 1: Generate Itinerary as Guest

1. Open your frontend app (make sure you're NOT logged in)
2. Enter a prompt like "3 days trip to Gangtok"
3. Click search
4. ✅ Should generate itinerary successfully
5. ⚠️ Note: Itinerary won't be saved (no `itineraryId` in response)

### Test 2: Generate Itinerary as Logged-in User

1. Login or register a user
2. Enter a prompt and search
3. ✅ Should generate itinerary AND save it
4. ✅ Should see `itineraryId` in response (check browser console)

### Test 3: Chat with Sherpa

1. Click the chat icon (bottom right)
2. Send a message
3. ✅ Should get response from backend
4. ✅ Session ID should be maintained for guest users
5. ✅ If logged in, chat history should persist

---

## 📊 How It Works Now

### **Itinerary Generation Flow:**

```
Frontend (User Input)
  ↓
Hero Component
  ↓
App.tsx (handleSearch)
  ↓
ai.ts (generateItinerary)
  ↓
api.ts (apiClient.generateItinerary)
  ↓
Backend API: POST /api/itinerary/generate
  ↓
Backend: Calls Gemini AI
  ↓
Backend: Saves to MongoDB (if authenticated)
  ↓
Backend: Returns response
  ↓
Frontend: Displays itinerary
```

### **Chat Flow:**

```
Frontend (User Message)
  ↓
SikkimSherpa Component
  ↓
ai.ts (chatWithSherpa)
  ↓
api.ts (apiClient.sendChatMessage)
  ↓
Backend API: POST /api/chat/send
  ↓
Backend: Calls Gemini AI with history
  ↓
Backend: Saves to MongoDB
  ↓
Backend: Returns response + sessionId
  ↓
Frontend: Displays response, stores sessionId
```

---

## 🔍 Debugging

### Check if Backend is Running

```bash
# In your backend directory
curl http://localhost:8080/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Check Browser Console

Open browser DevTools (F12) and check:
- **Network tab**: Look for requests to `/api/itinerary/generate` or `/api/chat/send`
- **Console tab**: Check for any errors

### Common Issues

#### Issue 1: "API base URL is not configured"
**Solution:** Make sure `.env` has `VITE_API_BASE_URL=http://localhost:8080`

#### Issue 2: "Failed to fetch" or CORS errors
**Solution:** 
- Check if backend is running on port 8080
- Check backend CORS configuration allows your frontend origin
- Make sure `VITE_API_BASE_URL` matches your backend URL

#### Issue 3: 401 Unauthorized for itinerary generation
**Solution:** This is normal for guest users! Guest users can generate itineraries but they won't be saved.

#### Issue 4: Chat history not loading
**Solution:** 
- Check if session ID is being stored
- For logged-in users, check if token is valid
- Check backend logs for errors

---

## 🎯 Next Steps (Optional Features)

### 1. Show Itinerary History (If Logged In)
You can add a "My Itineraries" page to show user's saved itineraries:

```typescript
// In a component
const { isAuthenticated } = useAuth();

useEffect(() => {
  if (isAuthenticated) {
    apiClient.getItineraryHistory(1, 10)
      .then(response => {
        console.log('User itineraries:', response.data.itineraries);
      });
  }
}, [isAuthenticated]);
```

### 2. Delete Itineraries
Add a delete button in itinerary view:

```typescript
const handleDelete = async (itineraryId: string) => {
  try {
    await apiClient.deleteItinerary(itineraryId);
    // Refresh list or navigate away
  } catch (error) {
    console.error('Failed to delete:', error);
  }
};
```

### 3. Share Itineraries (If Backend Supports)
If your backend adds sharing functionality, you can fetch shared itineraries:

```typescript
const sharedItinerary = await apiClient.getItineraryById(shareId);
```

---

## ✅ Summary

- ✅ Frontend is fully connected to backend
- ✅ Guest users can generate itineraries (not saved)
- ✅ Logged-in users can generate and save itineraries
- ✅ Chat works for both guests and logged-in users
- ✅ Session management for chat persistence
- ✅ Business users can generate business-style itineraries

**Just update your `.env` file with the correct backend URL and you're ready to go!** 🚀

