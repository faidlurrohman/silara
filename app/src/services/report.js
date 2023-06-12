import axios from "./axios";
import { getUrl } from "../helpers/url";

export const getRealPlanCities = (params) => {
	return axios.get(getUrl("/api/report/real_plan_cities", params));
};
