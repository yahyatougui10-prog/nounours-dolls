/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        marron: '#795548',
        'marron-deep': '#5B3E33',
        'marron-soft': '#806454',
        'marron-tint': '#F1E8E2',
        cyan: '#22C7D6',
        'cyan-deep': '#0D7480',
        'cyan-tint': '#E2F4F6',
        red: '#C62828',
        'red-deep': '#A82020',
        'red-tint': '#F8E8E6',
        ivory: '#FBF7F2',
        paper: '#F7F0E7',
        cream: '#FFFDF9',
        sand: '#EFE6DD',
        blush: '#F6E4E0',
        sky: '#E4F5F7',
        butter: '#F7EEDC',
        cocoa: '#5E4238',
        ink: '#3D2F2F',
        muted: '#7A675E',
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(91,62,51,0.05), 0 14px 34px -24px rgba(91,62,51,0.32)',
        lift: '0 1px 2px rgba(91,62,51,0.06), 0 30px 64px -32px rgba(91,62,51,0.38)',
        glow: '0 0 0 1px rgba(34,199,214,0.28), 0 18px 44px -30px rgba(34,199,214,0.5)',
        campaign: '0 2px 4px rgba(91,62,51,0.05), 0 44px 96px -48px rgba(91,62,51,0.48)',
        modal: '0 48px 120px -44px rgba(45,30,24,0.55)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.75rem',
        '6xl': '3.5rem',
      },
      letterSpacing: {
        editorial: '-0.032em',
      },
    },
  },
  plugins: [],
}
