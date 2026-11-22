import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: "#FCFCFB",
          100: "#F9F8F5",
          200: "#F3F1EC",
          300: "#E8E5DC",
          400: "#D7D3C6",
          500: "#BFBAA9",
        },
        charcoal: {
          950: "#0F0F11",
          900: "#1A191B",
          800: "#2B2A2F",
          700: "#45434B",
          600: "#5D5B66",
          500: "#7A7785",
          400: "#9C99A8",
          300: "#C1BFCA",
          200: "#E2E0E7",
          100: "#F0EFF3",
        },
        branvidia: {
          50: "#FAF5FF",
          100: "#F3E8FF",
          200: "#E9D5FF",
          300: "#D8B4FE",
          400: "#C084FC",
          500: "#A855F7",
          600: "#9333EA",
          700: "#7E22CE",
          800: "#6B21A8",
          900: "#581C87",
          950: "#3B0764",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        serif: [
          "Newsreader",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(26, 25, 27, 0.04)',
        'editorial': '0 4px 16px -2px rgba(26, 25, 27, 0.06), 0 2px 4px -1px rgba(26, 25, 27, 0.03)',
        'elevated': '0 12px 32px -4px rgba(26, 25, 27, 0.08), 0 4px 8px -2px rgba(26, 25, 27, 0.04)',
      },
    },
  },
  plugins: [],
};

export default config;
