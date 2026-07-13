/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './entrypoints/**/*.{vue,js,ts}',
    './popup/**/*.{vue,js,ts}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#000000',
          raised: '#0a1012',
          border: '#122022',
        },
        accent: {
          DEFAULT: '#00e8f0',
          glow: '#33eef5',
          lime: '#7cff6b',
          ink: '#001214',
        },
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
