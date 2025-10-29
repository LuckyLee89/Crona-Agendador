/** @type {import('tailwindcss').Config} */
export default {
  content: ['./pages/**/*.{html,js}', './js/**/*.{js,ts}', './index.html'],
  theme: {
    extend: {
      colors: {
        emerald: { 600: '#059669', 700: '#047857' },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp'),
  ],
};
