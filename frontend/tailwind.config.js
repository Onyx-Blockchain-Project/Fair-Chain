/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        army: {
          50: '#f4f4f0',
          100: '#e8e8e0',
          200: '#d4d4c8',
          300: '#b8b8a8',
          400: '#9a9a88',
          500: '#7a7a68',
          600: '#5c5c50',
          700: '#4b5320',
          800: '#3d4219',
          900: '#2f3314',
          950: '#1a1c0b',
        },
        dark: {
          100: '#2a2a2a',
          200: '#1f1f1f',
          300: '#141414',
          400: '#0a0a0a',
          500: '#000000',
        }
      }
    },
  },
  plugins: [],
}
