/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2fbf4',
          100: '#e1f7e6',
          200: '#c5eed0',
          300: '#97e0ab',
          400: '#62c980',
          500: '#38ad5e',
          600: '#278d49',
          700: '#206f3c',
          800: '#1d5833',
          900: '#144629',
          950: '#0b2716',
        },
        sage: {
          50: '#f4f6f4',
          100: '#e6ebe6',
          200: '#cfdacf',
          300: '#adc0ae',
          400: '#86a188',
          500: '#67866a',
          600: '#506b52',
          700: '#415543',
          800: '#364538',
          900: '#2d392f',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 20px -2px rgba(20, 70, 41, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 10px 25px -5px rgba(20, 70, 41, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
