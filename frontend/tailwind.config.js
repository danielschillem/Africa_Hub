/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}','./components/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    {
      pattern: /^(bg|text|hover:bg)-(blue|purple|green|brand|indigo|emerald)-(50|100|200|600)$/,
      variants: ['hover', 'group-hover'],
    },
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e6f4ec', 100: '#c2e4ce', 200: '#9dd4b0',
          300: '#77c392', 400: '#52b274', 500: '#1A6B3C',
          600: '#155630', 700: '#104023', 800: '#0a2b17', 900: '#05150b',
        },
        gold: {
          50: '#fef9e7', 100: '#fef0c3', 200: '#fde49e',
          300: '#fdd879', 400: '#fccb54', 500: '#C9A227',
          600: '#a17f1e', 700: '#795e16', 800: '#503e0f', 900: '#281f07',
        },
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
