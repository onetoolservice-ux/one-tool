import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./shared/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "rgb(117, 163, 163)", 
          hover: "#0060DF",              
          light: "#E0F2F2",              
        },
        ui: {
          bg: "#F9FBFF",                 
          card: "#FFFFFF",               
          border: "#E5E7EB",             
          text: "#1E293B",               
        },
      },
      boxShadow: {
        'apple': '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
      }
    },
  },
  plugins: [],
};
export default config;
