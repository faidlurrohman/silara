module.exports = {
  content: ["./src/**/*.{html,js,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        noto: ["Noto Sans HK", "sans-serif"],
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  variants: {},
  plugins: [],
};
