/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        suvang: {
          50: '#fbf8ea',
          100: '#f5eecc',
          400: '#e0b445',
          500: '#d49b25',
          600: '#b87c1b',
        },
        sudam: {
          800: '#1b130c',
          900: '#100b07',
          950: '#090604',
        }
      }
    },
  },
  plugins: [],
}
