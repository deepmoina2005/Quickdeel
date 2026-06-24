export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
        ink: "#0f172a",
      },
      boxShadow: {
        soft: "0 12px 35px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
