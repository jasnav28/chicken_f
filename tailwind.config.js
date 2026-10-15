/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        surface: '#FFFFFF',
        border: '#E2E8F0',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        brand: {
          DEFAULT: '#15803D', // deep green
          hover: '#166534',
          light: '#DCFCE7',
          dark: '#14532D',
        },
        status: {
          placedText: '#B45309',
          placedBg: '#FEF3C7',
          confirmedText: '#1D4ED8',
          confirmedBg: '#DBEAFE',
          outText: '#6D28D9',
          outBg: '#EDE9FE',
          deliveredText: '#15803D',
          deliveredBg: '#DCFCE7',
          cancelledText: '#B91C1C',
          cancelledBg: '#FEE2E2',
        }
      },
      borderRadius: {
        card: '12px',
        btn: '10px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'page-title': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'section-title': ['18px', { lineHeight: '26px', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '24px' }],
        'caption': ['13px', { lineHeight: '18px' }],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
