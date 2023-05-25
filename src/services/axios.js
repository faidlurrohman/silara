import { message } from "antd";
import axios from "axios";
import Cookies from "js-cookie";
import { store } from "../store";
import { logoutAction } from "../store/actions/session";

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
    if (Cookies.get(process.env.REACT_APP_ACCESS_TOKEN) === undefined) {
      store.dispatch(logoutAction());
      message.error("Sesi anda berakhir");
    } else {
      if (error?.code === "ERR_BAD_RESPONSE" && error?.response?.data !== "") {
        message.error(error?.response?.data?.message || error.message);
      } else {
        console.log("error?.code", error?.code);
      }
    }

    return error;
  }
);

export default axiosInstance;
