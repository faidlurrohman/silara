module.exports = {
	content: ["./src/**/*.{html,js,jsx,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				noto: ["Noto Sans HK"],
			},
			colors: {
				primary: "#1677FF",
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
