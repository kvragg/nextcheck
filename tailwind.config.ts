import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-2": "var(--bg-2)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        muted: "var(--muted)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        card: "var(--card)",
        green: "var(--green)",
        "green-deep": "var(--green-deep)",
        gold: "var(--gold)",
        warn: "var(--warn)",
        fail: "var(--fail)",
        pass: "var(--green)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        display: ["clamp(38px, 4.5vw, 80px)", { lineHeight: "0.95", letterSpacing: "-0.04em" }],
        h2: ["clamp(26px, 3vw, 50px)", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
      },
      screens: {
        xs: "400px",
        "3xl": "1920px",
        "4xl": "2560px",
      },
      animation: {
        "hero-pan": "hero-pan 22s ease-in-out infinite alternate",
        "pulse-dot": "pulse-dot 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
