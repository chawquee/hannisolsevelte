/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Times', 'Georgia', 'serif'],
      },
      letterSpacing: {
        'wide': '3px',
      }
    },
  },
  plugins: [],
}