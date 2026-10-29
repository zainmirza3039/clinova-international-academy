/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f1f4f5',
          100: '#dfe7e9',
          200: '#c4d1d4',
          300: '#9fb4b9',
          400: '#78949b',
          500: '#557781',
          600: '#3e6370',
          700: '#264e60',
          800: '#082B4C',
          900: '#071f36',
          950: '#041727',
        },
        clinical: {
          50: '#f1f4f3',
          100: '#e1e9e7',
          200: '#c6d4d1',
          300: '#a3bbb7',
          400: '#7f9d9d',
          500: '#5e7d84',
          600: '#496a73',
          700: '#355864',
          800: '#264552',
          900: '#1b3440',
          950: '#10242d',
        },
        teal: {
          50: '#f1f5f2',
          100: '#e2ebe5',
          200: '#c6d8cc',
          300: '#9bb8a7',
          400: '#78988a',
          500: '#5e8274',
          600: '#4d705f',
          700: '#3d5f52',
          800: '#304d43',
          900: '#243b34',
          950: '#162a24',
        },
        surface: {
          50: '#F4F2EB',
          100: '#ebe8df',
          200: '#ddd9ce',
          300: '#cac5b9',
          400: '#b0aa9d',
          500: '#8b867b',
        },
      },
      fontFamily: {
        sans: ['Source Sans 3', 'system-ui', 'sans-serif'],
        heading: ['Newsreader', 'Georgia', 'serif'],
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
