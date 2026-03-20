/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      screens: {
        'xs': '320px',
      },
      minHeight: {
        'touch': '44px'
      }
    }
  },
  plugins: []
}
