/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: '#F0F7F4',
          100: '#DBEBE3',
          200: '#B7D7C7',
          300: '#85BE9F',
          400: '#4FA078',
          500: '#0F4C3A',
          600: '#0C3E2F',
          700: '#0A3226',
          800: '#08281F',
          900: '#062019',
        },
        accent: {
          50: '#FFF3EA',
          100: '#FFE1CC',
          200: '#FFC299',
          300: '#FFA466',
          400: '#FF8533',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        status: {
          excellent: '#10B981',
          good: '#14B8A6',
          average: '#F59E0B',
          poor: '#F97316',
          critical: '#EF4444',
        },
        surface: {
          DEFAULT: '#FAFAF7',
          card: '#FFFFFF',
          muted: '#F5F5F2',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(15, 76, 58, 0.08), 0 1px 2px -1px rgba(15, 76, 58, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(15, 76, 58, 0.08), 0 4px 6px -4px rgba(15, 76, 58, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
