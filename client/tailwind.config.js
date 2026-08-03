/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        saffron: {
          DEFAULT: "#FF9933",
          50: "#FFF4E9",
          100: "#FFE7CC",
          200: "#FFCE99",
          300: "#FFB566",
          400: "#FF9C33",
          500: "#FF9933",
          600: "#E67E00",
          700: "#B36200",
          800: "#804600",
          900: "#4D2A00",
        },
        darkgray: {
          DEFAULT: "#333333",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
