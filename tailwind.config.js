/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                ai: {
                    dark: "#020604", // Almost black, very subtle green
                    card: "#0A1610", // Darker, more neutral card
                    accent: "#22C55E", // Green 500 - slightly darker/richer than 400 for text readability
                    secondary: "#15803D", // Green 700
                    text: "#FFFFFF", // Pure white for max contrast
                    muted: "#94A3B8", // Slate 400 - Neutral gray for readability (stopped using green for text)
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                glow: {
                    'from': { boxShadow: '0 0 10px -10px #4ADE80' },
                    'to': { boxShadow: '0 0 20px 5px #4ADE8033' },
                }
            }
        },
    },
    plugins: [],
}
