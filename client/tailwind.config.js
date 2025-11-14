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
          // Simple 2-color theme
          primary: {
            DEFAULT: '#000000',
            dark: '#ffffff',
          },
        },
        fontFamily: {
          sans: ['Georgia', 'Times New Roman', 'serif'],
        },
      },
    },
    plugins: [],
  }