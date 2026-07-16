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
          primary:   '#000000',
          secondary: '#0a0a0a',
          elevated:  '#111111',
          card:      '#141414',
          hover:     '#1a1a1a',
        },
        border: {
          DEFAULT: '#262626',
          accent:  '#2563eb',
          dim:     '#1a1a1a',
        },
        accent: {
          blue:     '#2563eb',
          bright:   '#3b82f6',
          light:    '#60a5fa',
          glow:     'rgba(37, 99, 235, 0.35)',
        },
        text: {
          primary:   '#ffffff',
          secondary: '#a3a3a3',
          dim:       '#525252',
          accent:    '#3b82f6',
        },
        state: {
          check:     '#ef4444',
          checkGlow: 'rgba(239,68,68,0.15)',
          legal:     'rgba(59, 130, 246, 0.35)',
          selected:  'rgba(59, 130, 246, 0.55)',
          success:   '#3b82f6',
          warning:   '#a3a3a3',
        },
      },
      animation: {
        'fade-in':    'fadeIn 0.25s ease',
        'slide-up':   'slideUp 0.35s ease',
        'pulse-blue': 'pulseBlue 2s ease-in-out infinite',
        'countdown':  'countdownPop 0.4s ease',
        'glow-check': 'glowCheck 1s ease-in-out infinite alternate',
        'spin-slow':  'spin-slow 40s linear infinite',
      },
      keyframes: {
        fadeIn:       { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:      { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseBlue:    { '0%,100%': { boxShadow: '0 0 0 0 rgba(37,99,235,0)' }, '50%': { boxShadow: '0 0 0 5px rgba(37,99,235,0.25)' } },
        countdownPop: { '0%': { transform: 'scale(0.7)', opacity: '0' }, '60%': { transform: 'scale(1.1)', opacity: '1' }, '100%': { transform: 'scale(1)' } },
        glowCheck:    { from: { boxShadow: '0 0 8px rgba(239,68,68,0.3)' }, to: { boxShadow: '0 0 24px rgba(239,68,68,0.7)' } },
        'spin-slow':  { from: { transform: 'translate(-50%,-50%) rotate(0deg)' }, to: { transform: 'translate(-50%,-50%) rotate(360deg)' } },
      },
    },
  },
  plugins: [],
};
