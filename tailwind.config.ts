import type { Config } from "tailwindcss";

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
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(220 15% 8%)",
        foreground: "hsl(220 20% 98%)",
        primary: {
          DEFAULT: "hsl(220 100% 60%)",
          foreground: "hsl(220 20% 98%)",
          glow: "hsl(var(--primary-glow))",
          dark: "hsl(var(--primary-dark))",
        },
        secondary: {
          DEFAULT: "hsl(220 15% 20%)",
          foreground: "hsl(220 20% 95%)",
        },
        success: {
          DEFAULT: "hsl(142 76% 60%)",
          foreground: "hsl(220 20% 98%)",
          glow: "hsl(var(--success-glow))",
        },
        warning: {
          DEFAULT: "hsl(25 95% 65%)",
          foreground: "hsl(220 20% 98%)",
          glow: "hsl(var(--warning-glow))",
        },
        muted: {
          DEFAULT: "hsl(220 15% 35%)",
          foreground: "hsl(220 20% 85%)",
        },
        accent: {
          DEFAULT: "hsl(280 100% 70%)",
          foreground: "hsl(220 20% 98%)",
          glow: "hsl(var(--accent-glow))",
        },
        card: {
          DEFAULT: "hsl(220 15% 12%)",
          foreground: "hsl(220 20% 95%)",
        },
        popover: {
          DEFAULT: "hsl(220 15% 12%)",
          foreground: "hsl(220 20% 95%)",
        },
        destructive: {
          DEFAULT: "hsl(0 84% 60%)",
          foreground: "hsl(220 20% 98%)",
        },
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
      animation: {
        "fade-in": "fade-in 0.6s ease-out",
        "slide-up": "slide-up 0.6s ease-out",
        "slide-down": "slide-down 0.6s ease-out",
        "slide-left": "slide-left 0.6s ease-out",
        "slide-right": "slide-right 0.6s ease-out",
        "scale-in": "scale-in 0.5s ease-out",
        "bounce-in": "bounce-in 0.8s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "gradient-x": "gradient-x 15s ease infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-left": {
          "0%": { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-right": {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--primary) / 0.3)" },
          "50%": { boxShadow: "0 0 40px hsl(var(--primary) / 0.6)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "gradient-x": {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
