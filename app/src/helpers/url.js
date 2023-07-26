import _ from "lodash";

export const getUrl = (url = "", params = {}) => {
	let limit = params?.pagination?.pageSize;
	let offset = params?.pagination?.pageSize * (params?.pagination?.current - 1);
	let order = "";
	let filters = [];

	if (params?.columnKey && params?.field && params?.order) {
		let type = "";

		if (params?.order === "ascend") {
			type = params?.order.substring(0, 3);
		} else if (params?.order === "descend") {
			type = params?.order.substring(0, 4);
		}

		order = `&order=${params?.field} ${type}`;
	}

	if (params?.filters) {
		_.mapValues(params?.filters, (__, key) => {
			if (params?.filters[key]) {
				// for date range
				if (key.includes("date") && params?.filters[key][0].length > 1) {
					_.map(params?.filters[key][0], (f, i) => {
						filters.push(`&filter[${key}_${i === 0 ? `start` : `end`}]=${f}`);
					});
				} else {
					//any else here
					filters.push(`&filter[${key}]=${params?.filters[key][0]}`);
				}
			}
		});
	}

	return `${url}?limit=${limit}&offset=${offset}${order}${filters.join("")}`;
};

export const checkParams = (params, withId, key = "", useExport = false) => {
	if (withId) {
		params = {
			...params,
			filters: { ...params.filters, [key]: [withId] },
		};
	}

	if (useExport) {
		params = {
			...params,
			pagination: { ...params.pagination, pageSize: 0 },
		};
	}

	return params;
};
