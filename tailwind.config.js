/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary-base)",
          hover: "var(--color-primary-hover)",
          active: "var(--color-primary-active)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary-base)",
          muted: "var(--color-secondary-muted)",
        },
        accent: {
          DEFAULT: "var(--color-accent-base)",
          hover: "var(--color-accent-hover)",
        },
        surface: {
          base: "var(--color-surface-base)",
          card: "var(--color-surface-card)",
        },
        text: {
          main: "var(--color-text-main)",
          inverse: "var(--color-text-inverse)",
        },
        status: {
          success: "var(--color-success)",
          error: "var(--color-error)",
        },
        border: {
          DEFAULT: "var(--color-border)",
        },
      },
      fontFamily: {
        sans: ["Inter", "Readex Pro", "sans-serif"],
      },
    },
  },
  plugins: [],
};