/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sofia: {
          bg: '#020617',
          surface: '#0f172a',
          border: '#1e293b',
          emerald: '#10b981',
          emeraldhover: '#059669',
        }
      }
    }
  },
  plugins: []
}
