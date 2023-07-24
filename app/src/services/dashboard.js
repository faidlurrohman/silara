import axios from "./axios";
import { getUrl } from "../helpers/url";

export const getDashboard = (params) => {
	return axios.get(getUrl("/api/dashboard", params));
};

export const getRecapYears = () => {
	return axios.get("/api/dashboard/recap_years");
};
