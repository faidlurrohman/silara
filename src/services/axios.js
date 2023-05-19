import { message } from "antd";
import axios from "axios";
import Cookies from "js-cookie";

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
    message.error(error?.response?.data?.message || error.message);

    return error;
  }
);

export default axiosInstance;
