module.exports = {
	content: ["./src/**/*.{html,js,jsx,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				noto: ["Noto Sans HK Regular"],
				medium: ["Noto Sans HK Medium"],
			},
			colors: {
				main: "#1C4F49",
				mainDark: "#18423d",
				secondary: "#FC671A",
				secondaryOpacity: "rgba(252, 103, 26, 0.3)",
				info: "#95BDFF",
				success: "#B5F1CC",
				danger: "#F7A4A4",
			},
		},
	},
	corePlugins: {
		preflight: false,
	},
	variants: {},
	plugins: [],
};
