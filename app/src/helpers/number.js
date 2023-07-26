export const formatterNumber = (val) => {
	if (!val) return 0;
	return `${val}`
		.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
		.replace(/\.(?=\d{0,2}$)/g, ",");
};

export const parserNumber = (val) => {
	if (!val) return 0;
	return Number.parseFloat(
		val.replace(/\$\s?|(\.*)/g, "").replace(/(,{1})/g, ".")
	).toFixed(2);
};

export const parseNaN = (value) => {
	return isNaN(value) ? 0 : value;
};
