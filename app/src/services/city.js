import axios from "./axios";
import { getUrl } from "../helpers/url";

export const getCities = (params) => {
	return axios.get(getUrl(`/api/city/data`, params));
};

export const getCityList = () => {
	return axios.get(`/api/city/list`);
};

export const addCity = (values) => {
	return axios.post(`/api/city/add`, values);
};

export const setActiveCity = (id) => {
	return axios.delete(`/api/city/remove/${id}`);
};
