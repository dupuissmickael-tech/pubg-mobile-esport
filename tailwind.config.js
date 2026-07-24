/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0f1f2e",
          800: "#16293b",
          700: "#1f374d",
        },
        marine: {
          600: "#1e4d6b",
          700: "#173d56",
        },
      },
      fontFamily: {
        sans: [
          "Source Sans Pro",
          "Segoe UI",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};
