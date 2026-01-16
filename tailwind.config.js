/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'court-green': '#00B872',
        'light-bg': '#FFFFFF',
        'card-bg': '#F8F9FA',
        'border-color': '#E1E4E8',
        'accent-orange': '#FF6B35',
        'text-primary': '#1A1F26',
        'text-secondary': '#6B7280',
      },
    },
  },
  plugins: [],
}
