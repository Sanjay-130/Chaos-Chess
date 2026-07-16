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
          primary: '#0f172a', // slate-900
          secondary: '#1e293b', // slate-800
          elevated: '#334155', // slate-700
          card: '#1e293b',
          hover: '#475569', // slate-600
        },
        border: {
          DEFAULT: '#334155',
          accent: '#3b82f6',
          dim: '#1e293b',
        },
        accent: {
          blue: '#2563eb',
          bright: '#3b82f6',
          teal: '#06b6d4',
          tealGlow: 'rgba(6, 182, 212, 0.4)',
          glow: 'rgba(37,99,235,0.3)',
        },
        text: {
          primary: '#f0f6ff',
          secondary: '#94a3b8',
          dim: '#475569',
          accent: '#06b6d4',
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
        'spin-slow': 'spin 30s linear infinite',
        'pulse-teal': 'pulseTeal 2s ease-in-out infinite',
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
        pulseTeal: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(6,182,212,0)' },
          '50%': { boxShadow: '0 0 0 8px rgba(6,182,212,0.3)' },
        },
      },
    },
  },
  plugins: [],
};
