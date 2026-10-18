/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef3f8',
          100: '#d5e1ec',
          200: '#aac2d9',
          300: '#7fa3c6',
          400: '#5484b3',
          500: '#386b9e',
          600: '#255886',
          700: '#1a4a73',
          800: '#082B4C',
          900: '#062238',
          950: '#041a2c',
        },
        clinical: {
          50: '#eef5fb',
          100: '#d0e3f4',
          200: '#a3c7e8',
          300: '#76aadc',
          400: '#4a8fd1',
          500: '#1769AA',
          600: '#145e98',
          700: '#114c79',
          800: '#0e3b61',
          900: '#0a2a44',
          950: '#072033',
        },
        teal: {
          50: '#e6f7f4',
          100: '#c2ece5',
          200: '#85d9cb',
          300: '#48c5b1',
          400: '#0B9B8A',
          500: '#0a8b7b',
          600: '#087a6c',
          700: '#066358',
          800: '#054c44',
          900: '#033530',
          950: '#021e1b',
        },
        surface: {
          50: '#F4F7FA',
          100: '#e9eff5',
          200: '#d3e0eb',
          300: '#bdd0e0',
          400: '#9bb5cc',
          500: '#7ba0b8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
        editorial: ['Newsreader', 'Georgia', 'serif'],
      },
      maxWidth: {
        '8xl': '88rem',
        'editorial': '1400px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
};
