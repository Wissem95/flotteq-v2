import type { Config } from "tailwindcss";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        flotteq: {
          navy: '#1a3a6c',
          blue: '#2463b0',
          teal: '#14b8a6',
          turquoise: '#0ea5e9',
          light: '#f0f9ff',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
