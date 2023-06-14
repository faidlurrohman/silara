import axios from "./axios";
import { getUrl } from "../helpers/url";

export const getCities = (params) => {
	return axios.get(getUrl(`/api/city/data`, params));
};

export const getCityList = () => {
	return axios.get(`/api/city/list`);
};

export const addCity = (values) => {
	const formData = new FormData();
	formData.append("id", values?.id);
	formData.append("label", values?.label);
	formData.append("logo", values?.logo || ``);
	formData.append("blob", values?.blob);

	return axios.post(`/api/city/add`, formData, {
		headers: {
			"content-type": "multipart/form-data",
		},
	});
};

export const setActiveCity = (id) => {
	return axios.delete(`/api/city/remove/${id}`);
};
