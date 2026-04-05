import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class', // <--- THIS IS KEY for the toggle to work
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Accent color driven by --ot-accent-rgb CSS variable.
        // Supports opacity modifiers: bg-accent/10, text-accent/50, etc.
        accent: 'rgb(var(--ot-accent-rgb) / <alpha-value>)',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
