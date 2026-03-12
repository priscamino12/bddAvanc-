/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB', // Bleu
        secondary: '#1F2937', // Noir/gris
      },
    },
  },
  plugins: [],
  darkMode: 'class', // Pour thèmes clair/sombre
};