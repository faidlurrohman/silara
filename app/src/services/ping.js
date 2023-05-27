import axios from "./axios";

export const ping = () => {
  return axios.get("app/ping");
};
