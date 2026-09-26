import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          creamBg: "#F9F9F6",
          forestDark: "#162E21",
          forestPrimary: "#1E392A",
          leafGreen: "#2D6A4F",
          leafLight: "#22C55E",
          sageLight: "#EAF3DE",
          warmPill: "#F0F4E8",
          charcoal: "#111827",
          sky: "#0284C7",
          amber: "#F59E0B",
          red: "#EF4444"
        }
      },
      fontFamily: {
        sans: ["Inter", "Manrope", "sans-serif"],
        serif: ["Playfair Display", "Merriweather", "serif"]
      }
    }
  },
  plugins: []
};
export default config;
