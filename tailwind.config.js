/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4fa',
          100: '#dbe5f3',
          200: '#bdd0e8',
          300: '#91b3d8',
          400: '#5e8cc2',
          500: '#3d6ba8',
          600: '#2d5388',
          700: '#1e3d6a',
          800: '#152e52',
          900: '#0d1f3d',
          950: '#081428',
        },
        gold: {
          50: '#fdfbf3',
          100: '#faf5e0',
          200: '#f5eab8',
          300: '#eeda87',
          400: '#e5c45c',
          500: '#d4a82f',
          600: '#b88a1f',
          700: '#92681a',
          800: '#78521d',
          900: '#63431d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
