import _ from "lodash";
import { MESSAGE } from "./constants";
import { swal } from "./swal";

export const responseGet = (response) => {
	let _fix = {
		data: [],
		total_count: 0,
	};

	if (!!response?.data?.data.length) {
		_fix.total_count = response?.data?.data[0]?.__res_count || 0;

		_.map(response?.data?.data, (item) => {
			if (_fix.total_count) _fix.data.push(JSON.parse(item?.__res_data));
		});
	}

	return _fix;
};

export const messageAction = (isEdit = false) => {
	swal(`${isEdit ? MESSAGE?.edit : MESSAGE?.add}.`, "success");
};
