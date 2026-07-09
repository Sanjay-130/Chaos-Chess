/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: {
          primary: '#080b12',
          secondary: '#0d1117',
          elevated: '#131920',
          card: '#161d27',
          hover: '#1a2230',
        },
        border: {
          DEFAULT: '#1e2d3d',
          accent: '#2563eb',
          dim: '#162030',
        },
        accent: {
          blue: '#2563eb',
          bright: '#3b82f6',
          glow: 'rgba(37,99,235,0.3)',
        },
        text: {
          primary: '#f0f6ff',
          secondary: '#7c8fa6',
          dim: '#3d5166',
          accent: '#60a5fa',
        },
        state: {
          check: '#ef4444',
          checkGlow: 'rgba(239,68,68,0.25)',
          legal: 'rgba(37,99,235,0.4)',
          selected: 'rgba(37,99,235,0.6)',
          success: '#22c55e',
          warning: '#f59e0b',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease',
        'slide-up': 'slideUp 0.3s ease',
        'pulse-blue': 'pulseBlue 2s ease-in-out infinite',
        'countdown': 'countdownPop 0.4s ease',
        'glow-check': 'glowCheck 1s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseBlue: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(37,99,235,0)' },
          '50%': { boxShadow: '0 0 0 4px rgba(37,99,235,0.2)' },
        },
        countdownPop: {
          '0%': { transform: 'scale(0.7)', opacity: '0' },
          '60%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)' },
        },
        glowCheck: {
          from: { boxShadow: '0 0 8px rgba(239,68,68,0.3)' },
          to: { boxShadow: '0 0 20px rgba(239,68,68,0.6)' },
        },
      },
    },
  },
  plugins: [],
};
