/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#FAF9F6',
        gold: {
          light: '#DFC79C',
          DEFAULT: '#C5A46D',
          dark: '#A9844B'
        },
        beige: {
          light: '#F5EFEB',
          DEFAULT: '#EDE5D8',
          border: '#EAE5DC'
        },
        charcoal: {
          light: '#555555',
          DEFAULT: '#333333',
          dark: '#1C1C1C'
        },
        warmgrey: '#777777'
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif']
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(197, 164, 109, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'luxury': '0 10px 30px -4px rgba(197, 164, 109, 0.15), 0 4px 12px -2px rgba(0, 0, 0, 0.05)',
        'elevated': '0 20px 40px -10px rgba(0, 0, 0, 0.08)'
      }
    },
  },
  plugins: [],
}

