import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      colors: {
        blush: {
          50:  '#fdf4f4',
          100: '#fce8e9',
          200: '#f9d5d6',
          300: '#f4b2b4',
          400: '#ec8487',
          500: '#e05c60',
          600: '#cc3f44',
          700: '#ab3034',
          800: '#8e2b2f',
          900: '#78282c',
        },
        sage: {
          50:  '#f3f7f4',
          100: '#e3ede5',
          200: '#c8dbcc',
          300: '#a1c0a8',
          400: '#739f7d',
          500: '#51825c',
          600: '#3d6847',
          700: '#31533a',
          800: '#294330',
          900: '#223728',
        },
        champagne: {
          50:  '#faf8f2',
          100: '#f3ede0',
          200: '#e8d9be',
          300: '#d9bf94',
          400: '#c9a167',
          500: '#bd8b4c',
          600: '#a87040',
          700: '#8b5636',
          800: '#714630',
          900: '#5c3a29',
        },
      },
      backgroundImage: {
        'floral-pattern': "url('/floral-bg.svg')",
      },
    },
  },
  plugins: [],
}
export default config
