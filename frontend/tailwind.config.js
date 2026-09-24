/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4fbe8',
          100: '#e6f7cc',
          200: '#ceef9d',
          300: '#b0e366',
          400: '#94d337',
          500: '#86c240', // Brand signature lime-green
          600: '#699f2a',
          700: '#4f7b22',
          800: '#406220',
          900: '#36531d',
          950: '#1a2e0a',
        },
        navy: {
          800: '#1b2533',
          900: '#0f172a',
          950: '#0a0f1d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
        heading: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 12px -2px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 12px 24px -4px rgba(0, 0, 0, 0.1), 0 6px 8px -3px rgba(0, 0, 0, 0.05)',
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
