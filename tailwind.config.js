module.exports = {
  content: ["./src/**/*.{html,js,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        noto: ["Noto Sans HK", "sans-serif"],
      },
      colors: {
        primary: "#1677ff",
        secondary: "#FF9E16",
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  variants: {},
  plugins: [],
};
