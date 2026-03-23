/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Koh Santepheap", "sans-serif"],
        brand: ["Moul", "Koh Santepheap", "sans-serif"]
      },
      colors: {
        brand: {
          white: "#FFFFFF",
          ink: "#1A1A1A",
          blue: "#2563EB",
          electric: "#0052FF",
          mist: "#F5F7FB",
          line: "#E5E7EB"
        },
        grade: {
          10: "#DBEAFE",
          11: "#DCFCE7",
          12: "#FCE7F3"
        }
      },
      boxShadow: {
        sheet: "0 -24px 80px rgba(0, 0, 0, 0.16)",
        card: "0 18px 40px rgba(37, 99, 235, 0.08)"
      },
      backgroundImage: {
        graph:
          "linear-gradient(to right, rgba(229,231,235,0.7) 1px, transparent 1px), linear-gradient(to bottom, rgba(229,231,235,0.7) 1px, transparent 1px)"
      },
      backgroundSize: {
        graph: "26px 26px"
      },
      letterSpacing: {
        brand: "0.08em"
      }
    }
  },
  plugins: []
};
