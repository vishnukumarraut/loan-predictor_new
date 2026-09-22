/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fintech: {
          bg: '#030712',
          card: '#0b1329',
          border: 'rgba(59, 130, 246, 0.2)',
          accent: '#3b82f6',
          purple: '#8b5cf6',
          cyan: '#06b6d4',
          muted: '#64748b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(59, 130, 246, 0.3)',
        'purple-glow': '0 0 25px -5px rgba(139, 92, 246, 0.3)',
      }
    },
  },
  plugins: [],
}
