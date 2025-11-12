/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#14b8a6',
          dark: '#0d9488',
        },
        accent: {
          DEFAULT: '#fbbf24',
          dark: '#f59e0b',
        },
        background: {
          DEFAULT: '#1a1a1a',
          light: '#ffffff',
        },
        surface: {
          DEFAULT: '#2d2d2d',
          light: '#f3f4f6',
        },
        text: {
          DEFAULT: '#f3f4f6',
          light: '#1a1a1a',
          muted: '#9ca3af',
        },
      },
    },
  },
  plugins: [],
};

