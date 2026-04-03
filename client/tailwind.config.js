/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base surfaces
        base:     "#0d0d0d",
        surface:  "#141414",
        elevated: "#1c1c1c",
        border:   "#252525",
        // Accents
        neon:     "#00ffd2",   // Electric Cyan
        ember:    "#ff6b2b",   // Google AI Studio orange
        // Text
        ink:      "#f0f0f0",
        muted:    "#6b6b6b",
        faint:    "#2e2e2e",
        // Semantic
        success:  "#00ffd2",
        warning:  "#f59e0b",
        danger:   "#ef4444",
        info:     "#3b82f6",
      },
      fontFamily: {
        sans:  ['"DM Sans"', 'sans-serif'],
        head:  ['"Space Grotesk"', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        pill: '999px',
      },
    },
  },
  plugins: [],
}
