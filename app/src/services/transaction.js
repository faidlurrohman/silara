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

export const getTransactionObjectList = (use_mode) => {
	return axios.get(`/api/transaction/object_list?filter[use_mode]=${use_mode}`);
};

export const getLastTransaction = ({ trans_date, account_object_id }) => {
	return axios.get(
		`/api/transaction/last_transaction?filter[trans_date]=${trans_date}&filter[account_object_id]=${account_object_id}`
	);
};
