import axios from "./axios";
import { getUrl } from "../helpers/url";

export const getUsers = (params) => {
	return axios.get(getUrl("/api/user/data", params));
};

export const addUser = (values) => {
	return axios.post("/api/user/add", values);
};

export const setActiveUser = (id) => {
	return axios.delete(`/api/user/remove/${id}`);
};

export const updatePasswordUser = (values) => {
	return axios.post("/api/user/update_password", values);
};
