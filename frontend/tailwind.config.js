/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ["'JetBrains Mono'", "'Fira Code'", 'monospace'],
      },
      colors: {
        base:  '#070910',
        card:  '#0d1117',
        'card-alt': '#111827',
        brand: {
          DEFAULT: '#06b6d4',
          dim: 'rgba(6,182,212,0.15)',
          glow: 'rgba(6,182,212,0.35)',
        }
      },
      animation: {
        'ping-slow': 'ping-slow 2s cubic-bezier(0,0,0.2,1) infinite',
        'glow':      'glow-pulse 3s ease-in-out infinite',
        'float':     'float 4s ease-in-out infinite',
        'blink':     'blink 1.1s step-end infinite',
        'shimmer':   'shimmer 1.6s infinite',
        'bar-fill':  'bar-fill 1.2s cubic-bezier(0.16,1,0.3,1) both',
        'slide-up':  'slide-up 0.45s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':   'fade-in 0.3s ease both',
      },
      keyframes: {
        'ping-slow': {
          '0%':    { transform: 'scale(1)',   opacity: '0.75' },
          '70%,100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        'glow-pulse': {
          '0%,100%': { boxShadow: '0 0 12px rgba(6,182,212,0.2)' },
          '50%':     { boxShadow: '0 0 28px rgba(6,182,212,0.45)' },
        },
        'float': {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-6px)' },
        },
        'blink': {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'bar-fill': {
          from: { width: '0%' },
        },
        'slide-up': {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
