/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night1: '#0b1026',
        night2: '#1b2340',
        night3: '#2a2f55',
        gold: '#f5d78e',
      },
    },
  },
  plugins: [],
}
