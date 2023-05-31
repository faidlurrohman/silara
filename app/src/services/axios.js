import { message } from "antd";
import axios from "axios";
import Cookies from "js-cookie";
import { store } from "../store";
import { logoutAction } from "../store/actions/session";
import { ping } from "./ping";

const axiosInstance = axios.create({
	baseURL: process.env.REACT_APP_BASE_URL_API,
	headers: {
		Accept: "application/json",
		"Content-Type": "application/json",
		Authorization: `Bearer ${Cookies.get(process.env.REACT_APP_ACCESS_TOKEN)}`,
	},
});

axiosInstance.interceptors.request.use((config) => {
	return {
		...config,
		headers: {
			...config.headers,
			Authorization: `Bearer ${Cookies.get(
				process.env.REACT_APP_ACCESS_TOKEN
			)}`,
		},
	};
});

axiosInstance.interceptors.response.use(
	(response) => {
		return response;
	},
	async (error) => {
		// due internet connection
		if (!navigator.onLine) {
			message.error("Tidak ada koneksi internet");
		} else {
			// check connection db
			ping().then((p) => {
				if (p?.data?.status) {
					// check token authotrization
					if (error?.response?.status === 401) {
						store.dispatch(logoutAction());
						message.error(
							error?.response?.data?.message ||
								error.message ||
								"Data pengguna tidak terdaftar"
						);
					} else if (
						Cookies.get(process.env.REACT_APP_ACCESS_TOKEN) === undefined
					) {
						store.dispatch(logoutAction());
						message.error("Sesi anda berakhir");
					} else if (
						// any error was handled
						error?.code === "ERR_BAD_RESPONSE" &&
						error?.response?.data !== ""
					) {
						message.error(error?.response?.data?.message || error.message);
					} else {
						// any error here
						console.log("error?.code", error?.code);
					}
				} else {
					// due db connection
					message.error("Tidak ada koneksi database");
					return error;
				}
			});
		}

		return error;
	}
);

export default axiosInstance;
