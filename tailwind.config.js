/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        midnight: '#0F172A',
        slate: {
          850: '#1E293B',
        },
        lime: {
          400: '#84CC16',
        },
        indigo: {
          500: '#6366F1',
        },
      },
      animation: {
        'breathe': 'breathe 2s ease-in-out infinite',
        'ring': 'ring-pulse 2s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
