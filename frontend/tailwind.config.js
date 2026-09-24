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
          100: '#ecf9d6',
          200: '#d9f1a8',
          300: '#b8e36d',
          400: '#9bd340',
          500: '#86c240',
          600: '#6ca430',
          700: '#4f7d24',
          800: '#3d611c',
          900: '#2c4616',
          950: '#1d2d12',
        },
        navy: {
          800: '#1b2533',
          900: '#0f172a',
          950: '#0a0f1d',
        },
        accent: {
          50: '#eefbff',
          500: '#12b5e0',
          600: '#0f9dcc',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
        heading: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 10px 25px -15px rgba(15, 23, 42, 0.18), 0 4px 12px -8px rgba(15, 23, 42, 0.08)',
        'card-hover': '0 18px 32px -18px rgba(15, 23, 42, 0.22), 0 8px 18px -10px rgba(15, 23, 42, 0.12)',
        'subtle': '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px 0 rgba(15, 23, 42, 0.04)',
      },
      backgroundImage: {
        'hero-pattern': 'radial-gradient(circle at top left, rgba(134, 194, 64, 0.2), transparent 32%), radial-gradient(circle at bottom right, rgba(18, 181, 224, 0.14), transparent 28%)',
      },
    },
  },
  plugins: [],
}
