/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{json,md}"
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          deep: "#080b12",
          charcoal: "#101826",
          panel: "#141f2f",
          glass: "rgba(18, 28, 42, 0.72)"
        },
        text: {
          base: "#ebf2ff",
          muted: "#a8b7cc",
          subtle: "#7e8ea8"
        },
        brand: {
          aurora: "#5ce3d7",
          violet: "#9a7bff",
          highland: "#8dbb9c",
          highlandDeep: "#567a66"
        }
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Space Grotesk", "Sora", "Inter", "sans-serif"],
        body: ["var(--font-body)", "Inter", "Segoe UI", "sans-serif"]
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        26: "6.5rem"
      },
      borderRadius: {
        soft: "1rem",
        panel: "1.25rem",
        pill: "999px"
      },
      boxShadow: {
        panel: "0 20px 45px rgba(3, 8, 18, 0.45)",
        glow: "0 0 0 1px rgba(92, 227, 215, 0.16), 0 0 30px rgba(92, 227, 215, 0.2)",
        "glow-violet": "0 0 0 1px rgba(154, 123, 255, 0.22), 0 0 30px rgba(154, 123, 255, 0.2)"
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)"
      },
      backgroundImage: {
        aurora:
          "radial-gradient(circle at 25% 20%, rgba(92, 227, 215, 0.28), transparent 45%), radial-gradient(circle at 80% 10%, rgba(154, 123, 255, 0.26), transparent 40%), radial-gradient(circle at 50% 88%, rgba(141, 187, 156, 0.22), transparent 42%)"
      },
      maxWidth: {
        "screen-shell": "72rem"
      }
    }
  },
  plugins: []
};
