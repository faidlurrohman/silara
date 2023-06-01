import axios from "./axios";
import { getUrl } from "../helpers/url";

export const getTransaction = (params) => {
	return axios.get(getUrl("/api/transaction/data", params));
};

export const addTransaction = (values) => {
	return axios.post("/api/transaction/add", values);
};

export const setActiveTransaction = (id) => {
	return axios.delete(`/api/transaction/remove/${id}`);
};

export const getTransactionObjectList = () => {
	return axios.get(`/api/transaction/object_list`);
};

export const getLastTransaction = (object_id) => {
	return axios.get(
		`/api/transaction/last_transaction?filter[account_object_id]=${object_id}`
	);
};
