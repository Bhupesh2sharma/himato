# Sikkim Tourism AI-Powered Travel Planner

A modern, AI-powered travel planning application for Sikkim tourism with authentication, user registration, and itinerary generation.

## Features

- 🤖 AI-powered itinerary generation
- 🔐 User authentication (Login/Register)
- 👥 Support for regular and business users
- 🎫 Guest access (use without login)
- 📋 Terms and Conditions page
- 🎨 Modern, responsive UI with glassmorphism design
- 🚀 Production-ready authentication system

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Backend API Base URL
# Add your backend API URL here (e.g., https://api.yourdomain.com)
VITE_API_BASE_URL=http://localhost:3000

# Google Gemini API Key for AI itinerary generation
VITE_API_KEY=your_google_gemini_api_key_here
```

### 2. Backend API Endpoints

The application expects the following backend endpoints:

- `POST /api/users/login` - User login
- `POST /api/users/register` - User registration
- `GET /api/users/me` - Get current user (requires authentication token)

#### Login Request Format:
```json
{
  "email": "user@example.com",
  "password": "userpassword123"
}
```

#### Registration Request Format:
```json
{
  "name": "Bhupesh Sharma",
  "email": "techbhupesh@gmail.com",
  "phoneNo": "9733814168",
  "password": "userpassword123",
  "acceptTermsAndConditions": true,
  "business": false,
  "businessName": ""
}
```

**Note:** For business users, set `business: true` and provide `businessName`. For regular users, `business` should be `false` and `businessName` can be empty.

### 3. Installation

```bash
npm install
```

### 4. Development

```bash
npm run dev
```

### 5. Build

```bash
npm run build
```

## Authentication Features

- **Guest Access**: Users can use the platform without creating an account
- **User Registration**: Support for both regular and business users
- **Secure Authentication**: JWT token-based authentication with localStorage
- **Terms Acceptance**: Required checkbox for terms and conditions during registration
- **Business Toggle**: Optional business account with business name field

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Framer Motion (animations)
- Tailwind CSS
- Lucide React (icons)

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
