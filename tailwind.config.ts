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
        sans: ['var(--font-lato)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
      },
      colors: {
        // Legacy (kept for existing dashboard pages)
        blush: {
          50: '#fdf4f4', 100: '#fce8e9', 200: '#f9d5d6', 300: '#f4b2b4',
          400: '#ec8487', 500: '#e05c60', 600: '#cc3f44', 700: '#ab3034',
          800: '#8e2b2f', 900: '#78282c',
        },
        sage: {
          50: '#f3f7f4', 100: '#e3ede5', 200: '#c8dbcc', 300: '#a1c0a8',
          400: '#739f7d', 500: '#51825c', 600: '#3d6847', 700: '#31533a',
          800: '#294330', 900: '#223728',
        },
        champagne: {
          50: '#faf8f2', 100: '#f3ede0', 200: '#e8d9be', 300: '#d9bf94',
          400: '#c9a167', 500: '#bd8b4c', 600: '#a87040', 700: '#8b5636',
          800: '#714630', 900: '#5c3a29',
        },
        // New South Asian palette
        cream: {
          50: '#FDF8F0',
          100: '#F7EDD8',
          200: '#EFD9B0',
          300: '#E3C285',
        },
        gold: {
          50: '#FBF5E0',
          100: '#F5E9B8',
          200: '#EDCF6E',
          300: '#DFBF5A',
          400: '#C9A84C',
          500: '#B8923A',
          600: '#8B6914',
          700: '#6B4F0F',
          800: '#4A360A',
          900: '#2C1E05',
        },
        henna: {
          50: '#FFF0EC',
          100: '#FFD9CC',
          200: '#FFA880',
          300: '#E06840',
          400: '#C1440E',
          500: '#8B2500',
          600: '#6B1C00',
          700: '#4A1300',
        },
        brown: {
          50: '#FDF8F5',
          100: '#F5E9E0',
          200: '#E8CEB8',
          300: '#D4A882',
          400: '#B8825A',
          500: '#8B5E38',
          600: '#6B4226',
          700: '#4A2D18',
          800: '#2C1810',
          900: '#0F0804',
        },
      },
      boxShadow: {
        warm: '0 4px 24px rgba(139, 69, 20, 0.08)',
        'warm-md': '0 8px 32px rgba(139, 69, 20, 0.12)',
        'warm-lg': '0 16px 48px rgba(139, 69, 20, 0.16)',
      },
    },
  },
  plugins: [],
}
export default config
