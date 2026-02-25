/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './App.tsx',
        './index.tsx',
        './components/**/*.{ts,tsx}',
        './hooks/**/*.{ts,tsx}',
        './utils/**/*.{ts,tsx}',
        './services/**/*.{ts,tsx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                shimmer: {
                    '0%': { left: '-33%' },
                    '100%': { left: '100%' },
                },
                scan: {
                    '0%': { top: '0%', opacity: '0' },
                    '10%': { opacity: '1' },
                    '90%': { opacity: '1' },
                    '100%': { top: '100%', opacity: '0' },
                },
            },
        },
    },
    plugins: [],
};
