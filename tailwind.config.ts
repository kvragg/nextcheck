import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pass: "#10b981",
        warn: "#f59e0b",
        fail: "#ef4444",
      },
    },
  },
  plugins: [],
} satisfies Config;
