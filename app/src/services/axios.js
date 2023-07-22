import axios from "axios";
import Cookies from "js-cookie";
import { store } from "../store";
import { logoutAction } from "../store/actions/session";
import { ping } from "./ping";
import { swal } from "../helpers/swal";

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
			swal("Tidak ada koneksi internet", "warning");
		} else {
			// check connection db
			ping().then((p) => {
				if (p?.data?.status) {
					// kalau cookies expire langsung tendang ke login
					if (error?.response?.status === 401) {
						let msg = error?.response?.data?.message;

						if (msg) {
							swal(`${msg}.`, "warning");
						} else {
							swal("Sesi anda berakhir, silahkan masuk kembali.", "warning");
							store.dispatch(logoutAction());
						}
					} else {
						// any error was handled
						if (
							error?.code === "ERR_BAD_RESPONSE" &&
							error?.response?.data !== ""
						) {
							swal(`${error?.response?.data?.message || error.message}.`);
						} else {
							// any error here or not handle
							swal("Opps!!!");
							console.log("error?.code", error?.code);
						}
					}
				} else {
					// due db connection
					swal("Tidak ada koneksi database");
					return error;
				}
			});
		}

		return error;
	}
);

export default axiosInstance;
