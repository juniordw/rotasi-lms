/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#e6f1fe',
          100: '#cce3fd',
          200: '#99c7fb',
          300: '#66aaf9',
          400: '#338ef7', // Biru elektrik (primary)
          500: '#006fe5',
          600: '#0058b7',
          700: '#004289',
          800: '#002c5c',
          900: '#00162e',
        },
        coral: {
          50: '#fff0ed',
          100: '#ffe1db',
          200: '#ffc3b7',
          300: '#ffa593',
          400: '#ff866f', // Coral (accent)
          500: '#ff674b',
          600: '#cc523c',
          700: '#993e2d',
          800: '#66291e',
          900: '#33150f',
        },
        mint: {
          50: '#edfff7',
          100: '#dbffef',
          200: '#b7ffe0',
          300: '#93ffd0',
          400: '#6fffc1', // Mint (accent)
          500: '#4bffb1',
          600: '#3ccc8e',
          700: '#2d996a',
          800: '#1e6647',
          900: '#0f3323',
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      boxShadow: {
        'floating': '0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 4px 11px -3px rgba(0, 0, 0, 0.05)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': 'url("/images/hero-pattern.svg")',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}