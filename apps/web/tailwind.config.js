/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        hearth: {
          terracotta: {
            DEFAULT: '#C4562B',
            hover: '#AF4A23',
            active: '#993E1B',
            light: '#F8EDE7',
          },
          marigold: {
            DEFAULT: '#EFA531',
            hover: '#E59922',
            active: '#D48A14',
            light: '#FDF4E5',
          },
          leaf: {
            DEFAULT: '#2F7D5C',
            hover: '#266A4E',
            active: '#1E573F',
            light: '#EBF4F0',
          },
          warm: {
            bg: '#FFFDF9',
            surface: '#FFFFFF',
            muted: '#F5EFE8',
            border: '#E8DDD2',
            text: '#3A2E2A',
            subtext: '#6A5B55',
          },
          dark: {
            bg: '#171311',
            surface: '#1F1A17',
            raised: '#2A2320',
            border: '#3D3430',
            text: '#F5EFEB',
            subtext: '#B8AAA3',
          },
        },
      },
      fontFamily: {
        heading: ['"Source Serif 4"', 'Georgia', 'serif'],
        body: ['"Public Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        btn: '8px',
        card: '12px',
        input: '8px',
      },
      maxWidth: {
        content: '1200px',
      },
    },
  },
  plugins: [],
};
