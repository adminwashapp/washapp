/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Override the Tailwind blue palette with Washapp brand blue.
           bg-blue-600 / text-blue-600 / border-blue-600 etc.
           all resolve to the brand color automatically. */
        blue: {
          50:  '#eef4ff',
          100: '#d9e8ff',
          200: '#bcd6ff',
          300: '#8dbcff',
          400: '#5999ff',
          500: '#2f78ff',
          600: '#1558f5',   /* ← Washapp brand blue (main CTA) */
          700: '#1045e1',   /* ← hover state */
          800: '#1238b6',
          900: '#14348f',
          950: '#0f2260',
        },
        washapp: {
          blue:        '#1558f5',
          'blue-light':'#2f78ff',
          'blue-dark': '#1045e1',
          dark:        '#0f172a',
          gray:        '#64748b',
        },
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        btn:       '0 4px 14px 0 rgba(21, 88, 245, 0.35)',
        'btn-hover':'0 6px 22px 0 rgba(21, 88, 245, 0.50)',
      },
    },
  },
  plugins: [],
};
