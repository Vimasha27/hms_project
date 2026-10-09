/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcd9ff',
          300: '#8ec2ff',
          400: '#599fff',
          500: '#2f7bff',
          600: '#1b5bf5',
          700: '#1446e1',
          800: '#1739b6',
          900: '#18348f',
        },
        medical: {
          teal: '#0d9488',
          blue: '#0284c7',
          emerald: '#059669',
          amber: '#d97706',
          rose: '#e11d48',
        }
      },
    },
  },
  plugins: [],
}
