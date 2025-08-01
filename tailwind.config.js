/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-start': '#667eea',
        'brand-end': '#764ba2',
      },
      backdropFilter: {
        'blur-xl': 'blur(24px)',
      },
    },
  },
  plugins: [],
}
