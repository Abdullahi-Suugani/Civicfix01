/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        civic: {
          navy: "#16324A",     // primary — deep civic blue
          blue: "#2F6690",     // secondary blue
          teal: "#0E7C7B",     // interactive accent
          green: "#2F9E44",    // success / resolved
          amber: "#E8A33D",    // priority / CTA
          red: "#D64545",      // critical / rejected
          paper: "#F6F5F1",    // background (light "civic paper")
          ink: "#1B1F23",      // primary text
          mist: "#6B7686",     // muted text
          line: "#E2E4E8",     // borders
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(22,50,74,0.06), 0 4px 16px rgba(22,50,74,0.06)",
        stamp: "0 0 0 2px currentColor inset",
      },
      backgroundImage: {
        perforation:
          "radial-gradient(circle, transparent 4px, currentColor 4px) 0 0/14px 14px repeat-y",
      },
    },
  },
  plugins: [],
};
