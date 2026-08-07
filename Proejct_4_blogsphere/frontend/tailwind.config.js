/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // "Ink & Paper" editorial palette — see design notes in README.
        ink: {
          DEFAULT: '#14171F',
          50: '#F5F6F7',
          100: '#E5E7EB',
          200: '#C7CBD3',
          300: '#9AA1AE',
          400: '#6B7280',
          500: '#4B5160',
          600: '#363B48',
          700: '#262A34',
          800: '#1B1E26',
          900: '#14171F',
        },
        paper: {
          DEFAULT: '#F3F2ED',
          light: '#FBFAF7',
          dark: '#E8E6DD',
        },
        signal: {
          DEFAULT: '#1F3A5F',
          50: '#EAF0F6',
          100: '#CBDAE8',
          300: '#5B84AC',
          500: '#1F3A5F',
          600: '#193049',
          700: '#132538',
          900: '#0B1520',
        },
        stamp: {
          DEFAULT: '#C99A2E',
          light: '#E4BE63',
          dark: '#9C7620',
        },
        rose: {
          DEFAULT: '#C1443C',
          light: '#DE7168',
          dark: '#96322C',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(20, 23, 31, 0.04), 0 8px 24px rgba(20, 23, 31, 0.06)',
        'card-hover': '0 2px 4px rgba(20, 23, 31, 0.06), 0 16px 40px rgba(20, 23, 31, 0.10)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
