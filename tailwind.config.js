/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,md,mdx}",
    "./data/**/*.{json,md}"
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          deep: "#030507",
          charcoal: "#091018",
          panel: "#111b27",
          elevated: "#162332",
          glass: "rgba(12, 21, 31, 0.72)"
        },
        text: {
          base: "#edf5fd",
          muted: "#9cafc5",
          subtle: "#72839c"
        },
        brand: {
          aurora: "#7de8d9",
          teal: "#3fa89b",
          moss: "#85a67b",
          loch: "#79b2cf",
          twilight: "#7d74d6"
        }
      },
      fontFamily: {
        heading: ["Sora", "Avenir Next", "Segoe UI", "sans-serif"],
        body: ["Manrope", "Segoe UI", "sans-serif"],
        accent: ["Instrument Serif", "Georgia", "serif"]
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        26: "6.5rem",
        30: "7.5rem"
      },
      borderRadius: {
        soft: "1rem",
        panel: "1.5rem",
        pill: "999px"
      },
      boxShadow: {
        panel: "0 22px 56px rgba(0, 0, 0, 0.28)",
        glow: "0 0 0 1px rgba(125, 232, 217, 0.18), 0 0 48px rgba(121, 178, 207, 0.14)",
        "glow-strong": "0 0 0 1px rgba(125, 232, 217, 0.26), 0 18px 80px rgba(54, 122, 153, 0.22)"
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)"
      },
      backgroundImage: {
        aurora:
          "radial-gradient(circle at 20% 18%, rgba(125, 232, 217, 0.22), transparent 42%), radial-gradient(circle at 82% 16%, rgba(125, 116, 214, 0.22), transparent 38%), radial-gradient(circle at 54% 88%, rgba(133, 166, 123, 0.18), transparent 44%)"
      },
      maxWidth: {
        "screen-shell": "74rem"
      }
    }
  },
  plugins: []
};
