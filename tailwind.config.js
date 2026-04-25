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
                    dark:      "#f6f1e7", // Parchment — main app background
                    card:      "#ffffff", // White card surfaces
                    accent:    "#2f4a3a", // Forest Moss — primary brand (readable on light)
                    secondary: "#1a2e23", // Moss Deep — hover/active
                    text:      "#0e1116", // Ink — dark body text
                    muted:     "#6b7280", // Neutral gray — meta/placeholder
                    warm:      "#b73f25", // Vermilion — CTA variant
                    saffron:   "#d97a2c", // Saffron — decorative
                    gold:      "#c9a961", // Gold — accent on dark surfaces
                }
            },
            fontFamily: {
                sans:    ['Inter', 'sans-serif'],
                display: ['Fraunces', 'Georgia', 'serif'],
                mono:    ['JetBrains Mono', 'monospace'],
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
                    'from': { textShadow: '0 0 10px rgba(47,74,58,0)' },
                    'to':   { textShadow: '0 0 24px rgba(47,74,58,0.35)' },
                }
            }
        },
    },
    plugins: [],
}
