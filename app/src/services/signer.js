import axios from "./axios";
import { getUrl } from "../helpers/url";

export const getSigner = (params) => {
	return axios.get(getUrl("/api/signer/data", params));
};

export const addSigner = (values) => {
	return axios.post("/api/signer/add", values);
};

export const getSignerList = () => {
	return axios.get(`/api/signer/list`);
};

export const setActiveSigner = (id) => {
	return axios.delete(`/api/signer/remove/${id}`);
};
