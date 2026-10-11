import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f8f6f1",
        ink: "#20201d",
        orange: "#e86532",
        leaf: "#27784c",
        brick: "#a93d31",
      },
      fontFamily: { sans: ["Arial", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
} satisfies Config;
