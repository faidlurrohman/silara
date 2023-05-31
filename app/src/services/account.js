import axios from "./axios";
import { getUrl } from "../helpers/url";

export const getAccount = (which, params) => {
	return axios.get(getUrl(`/api/account_${which}/data`, params));
};

export const getAccountList = (which) => {
	return axios.get(`/api/account_${which}/list`);
};

export const addAccount = (which, values) => {
	return axios.post(`/api/account_${which}/add`, values);
};

export const setActiveAccount = (which, id) => {
	return axios.delete(`/api/account_${which}/remove/${id}`);
};

export const setAllocationAccount = (which, values) => {
	return axios.post(`/api/account_${which}/allocation`, values);
};
