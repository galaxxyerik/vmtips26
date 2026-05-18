import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050d24',
          900: '#0a1a3a',
          850: '#0c1f47',
          800: '#0f2550',
          750: '#15306b',
          700: '#1c3a7e',
          600: '#274a9a',
          500: '#3b62b8',
          400: '#6286d4',
        },
        swe: {
          yellow: '#FFCD00',
          yellowHi: '#FFE066',
          blue: '#005EB8',
        },
        usa: {
          red: '#C8102E',
          redDim: '#8A0C20',
        },
        pitch: {
          400: '#34d399',
          500: '#10b981',
          900: '#064e3b',
        },
        loss: {
          500: '#b94a4a',
          900: '#4a1818',
        },
        // Legacy aliases — keep existing pages working
        surface: {
          900: '#050d24',
          800: '#0a1a3a',
          700: '#0c1f47',
          600: '#1c3a7e',
          500: '#274a9a',
          400: '#3b62b8',
        },
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        full: '9999px',
      },
      boxShadow: {
        none: '0 0 #0000',
        sm: '0 0 #0000',
        DEFAULT: '0 0 #0000',
        md: '0 0 #0000',
        lg: '0 0 #0000',
        xl: '0 0 #0000',
        '2xl': '0 0 #0000',
      },
    },
  },
  plugins: [],
}

export default config
