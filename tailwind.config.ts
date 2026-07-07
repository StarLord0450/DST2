import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#080b12",
        panel: "#0e131d",
        panel2: "#131a27",
        line: "#1e2837",
        ink: "#e7eefb",
        muted: "#7f8ba3",
        cyan: {
          DEFAULT: "#00f0ff",
          dim: "#0aa8b8",
        },
        magenta: {
          DEFAULT: "#ff2d78",
          dim: "#b81f56",
        },
        acid: "#39ff88",
        warn: "#ffb020",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        grid: "linear-gradient(to right, #131a2740 1px, transparent 1px), linear-gradient(to bottom, #131a2740 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      boxShadow: {
        glow: "0 0 24px -4px rgba(0,240,255,0.35)",
        glowMagenta: "0 0 24px -4px rgba(255,45,120,0.35)",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        blink: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        scan: "scan 3s linear infinite",
        blink: "blink 1.1s step-start infinite",
      },
    },
  },
  plugins: [],
};
export default config;
