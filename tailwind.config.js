/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "neon-blue": "#4a6ea9",
        "neon-blue-hover": "#688ad1",
        "dark-bg": "#2c2c2c",
        "dark-card": "#3a3a3a",
        "dark-item": "#2f2f2f",
        "text-main": "#eaeaea",
        "link-blue": "#9ab8ff",
        "delete-red": "#b33b3b",
        "delete-red-hover": "#d14e4e",
        "neon-green": "#39ff14",
      },
      boxShadow: {
        "glow-ext":
          "0 0 10px rgba(74, 110, 169, 0.5), 0 0 20px rgba(74, 110, 169, 0.3)",
        "glow-title":
          "0 0 5px rgba(74, 110, 169, 0.8), 0 0 10px rgba(74, 110, 169, 0.6), 0 0 20px rgba(74, 110, 169, 0.4)",
        "glow-selected":
          "0 0 8px rgba(74, 110, 169, 0.8), 0 0 15px rgba(74, 110, 169, 0.5)",
        card: "0 0 5px rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [],
};
