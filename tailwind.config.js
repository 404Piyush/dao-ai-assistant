/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        dao: {
          purple: '#8b5cf6',
          blue: '#06b6d4',
          green: '#10b981',
        }
      },
      animation: {
        'spin-reverse': 'spin 1s linear infinite reverse',
      },
    },
  },
  plugins: [],
} 