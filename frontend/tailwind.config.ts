import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Inter", "sans-serif"],
      },
      colors: {
        vendor: {
          dark: "hsl(var(--vendor-dark))",
          sidebar: "hsl(var(--vendor-sidebar))",
          gold: "hsl(var(--vendor-gold))",
          purple: "hsl(var(--vendor-purple))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
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
      boxShadow: {
        'glow-gold': '0 0 40px rgba(255, 209, 102, 0.4)',
        'glow-purple': '0 0 40px rgba(124, 92, 255, 0.4)',
        'elegant': '0 10px 40px -10px rgba(89, 80, 179, 0.15)',
        'glow': '0 0 40px rgba(120, 103, 220, 0.3)',
        'card': '0 2px 10px rgba(15, 15, 20, 0.05)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #5950b3, #7867dc)',
        'gradient-hero': 'linear-gradient(135deg, rgba(89, 80, 179, 0.05), rgba(255, 180, 0, 0.05))',
        'gradient-hero-dark': 'linear-gradient(135deg, rgba(89, 80, 179, 0.1), rgba(255, 180, 0, 0.1))',
        'gradient-card': 'linear-gradient(to bottom, #ffffff, #f7f7f8)',
        'gradient-card-dark': 'linear-gradient(to bottom, #1a1a1f, #1e1e23)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
