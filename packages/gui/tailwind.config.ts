import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gobble: {
          yellow: "#fbbf24",
          dark: "#1a1814",
          darker: "#141210",
          gray: "#242018",
          light: "#2e2920",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        wavy: "wavy 2s ease-in-out infinite",
        thinking: "thinking 1.5s ease-in-out infinite",
        gobble: "gobble-bounce 0.6s ease-in-out",
        "wave-flow": "wave-flow 3s ease-in-out infinite",
        waka: "waka 0.3s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
} satisfies Config;
