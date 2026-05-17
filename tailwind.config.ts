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
        display: ["clamp(48px, 7.2vw, 120px)", { lineHeight: "0.94", letterSpacing: "-0.04em" }],
        h2: ["clamp(32px, 4vw, 56px)", { lineHeight: "1.05", letterSpacing: "-0.025em" }],
      },
      animation: {
        "hero-pan": "hero-pan 22s ease-in-out infinite alternate",
        "pulse-dot": "pulse-dot 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
