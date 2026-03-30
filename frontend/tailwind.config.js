/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{html,ts,scss}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        body: ['Public Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        chinese: ['Noto Sans SC', 'sans-serif'],
      },
      colors: {
        // Override cyan palette to use brand primary rgb(132,162,166) = #84A2A6
        cyan: {
          50:  '#f3f7f8',
          100: '#e5eef0',
          200: '#c9dde1',
          300: '#a9cace',
          400: '#93b5b9',
          500: '#84a2a6',
          600: '#6d8d91',
          700: '#566d70',
          800: '#3f5052',
          900: '#2a3638',
          950: '#161e1f',
        },
        brand: {
          DEFAULT: '#84A2A6',
          glow: '#93b5b9',
          dim:  '#6d8d91',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(-10px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
};
