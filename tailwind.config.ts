import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // Editorial / athletic heritage palette — registered so opacity
        // modifiers (e.g. text-bone/60, border-ink/15) actually generate.
        ink: "hsl(var(--ink))",
        bone: "hsl(var(--bone))",
        "bone-2": "hsl(var(--bone-2))",
        gold: {
          DEFAULT: "hsl(var(--gold))",
          deep: "hsl(var(--gold-deep))",
        },
        silver: "hsl(var(--silver))",
        bronze: "hsl(var(--bronze))",
        crimson: "hsl(var(--crimson))",
        jade: "hsl(var(--jade))",
        cyan: "hsl(var(--cyan))",
        // Theme-flip semantic tokens — dark structural blocks (mastheads,
        // hero, header, footer, table headers, admin sidebar, active chips)
        // route through these so they invert in light mode. Canvas
        // (bg-bone/text-ink) stays literal and never flips.
        "surface-inv": "hsl(var(--surface-inv))",
        "on-inv": "hsl(var(--on-inv))",
        chip: "hsl(var(--chip))",
        "on-chip": "hsl(var(--on-chip))",
        // Theme-aware row/card hover (bold dark inversion in dark mode,
        // subtle warm-tan lift in light mode).
        highlight: "hsl(var(--highlight))",
        "on-highlight": "hsl(var(--on-highlight))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
