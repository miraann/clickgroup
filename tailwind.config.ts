import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        xs: '390px',
      },
      colors: {
        navy: {
          950: '#020817',
          900: '#050B18',
          800: '#0A1628',
          700: '#0F2040',
          600: '#162952',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        arabic: [
          'Noto Naskh Arabic',
          'Arabic Typesetting',
          'Traditional Arabic',
          'Arial',
          'sans-serif',
        ],
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'spin-slow': 'spin 30s linear infinite',
        'spin-slower': 'spin 50s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '33%': { transform: 'translateY(-20px) translateX(10px)' },
          '66%': { transform: 'translateY(-10px) translateX(-8px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}

export default config
