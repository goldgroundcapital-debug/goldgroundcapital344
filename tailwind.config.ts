import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FDFBF5",
          100: "#FAF6EA",
          200: "#F4ECD4",
          300: "#EBDFB8",
          400: "#DDC98C",
        },
        gold: {
          50: "#FBF4DC",
          100: "#F5E7B0",
          200: "#EAD075",
          300: "#DDB94A",
          400: "#C9A227",
          500: "#B08C1E",
          600: "#8C6E17",
          700: "#695213",
        },
        ink: {
          900: "#1A140A",
          800: "#2A2113",
          700: "#3D3120",
          600: "#594931",
          500: "#7A6748",
          400: "#A0896A",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["ui-serif", "Georgia", "Cambria", "serif"],
      },
      boxShadow: {
        gold: "0 10px 30px -10px rgba(201, 162, 39, 0.35)",
        soft: "0 1px 2px rgba(26,20,10,0.04), 0 8px 24px -12px rgba(26,20,10,0.10)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #EAD075 0%, #C9A227 50%, #8C6E17 100%)",
        "gold-shine": "linear-gradient(120deg, #F5E7B0 0%, #DDB94A 40%, #C9A227 60%, #F5E7B0 100%)",
      },
      keyframes: {
        floatY: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        floatY: "floatY 6s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
