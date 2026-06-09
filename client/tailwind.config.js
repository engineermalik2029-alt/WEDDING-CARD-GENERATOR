/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        glow: '0 30px 100px rgba(216, 180, 106, 0.24)'
      }
    }
  },
  plugins: []
};