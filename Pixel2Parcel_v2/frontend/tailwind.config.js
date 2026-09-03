/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        govt: {
          navy: '#0A2540',      // Primary Govt Header Navy
          blue: '#1D4ED8',      // Active Accent Blue
          light: '#F8FAFC',     // Background Grey
          border: '#CBD5E1',    // Panel Border
          text: '#0F172A',      // High Contrast Text
          muted: '#475569',     // Secondary Muted Text
          green: '#166534',     // Low Risk Green
          amber: '#B45309',     // Medium Risk Amber
          red: '#991B1B'        // High Risk Red
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
