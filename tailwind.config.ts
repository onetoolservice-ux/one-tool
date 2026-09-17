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
        // Fixed semantic colors — meaning is constant everywhere (never user-customizable).
        positive: { DEFAULT: 'var(--ot-positive)', tint: 'var(--ot-positive-tint)' },
        negative: { DEFAULT: 'var(--ot-negative)', tint: 'var(--ot-negative-tint)' },
        warning:  { DEFAULT: 'var(--ot-warning)',  tint: 'var(--ot-warning-tint)' },
        'neutral-value': 'var(--ot-neutral-value)',
        // Content accent for finance/biz tool pages only (links, primary buttons,
        // active nav within those pages) — separate from the app-wide `accent` token.
        'fin-accent': 'rgb(var(--ot-fin-accent-rgb) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
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
