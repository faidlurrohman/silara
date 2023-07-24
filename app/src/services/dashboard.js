import axios from "./axios";
import { getUrl } from "../helpers/url";

export const getDashboard = (params) => {
	return axios.get(getUrl("/api/dashboard", params));
};

export const getRecapYears = (params) => {
	return axios.get(getUrl("/api/dashboard/recap_years", params));
};
