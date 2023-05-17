import axios from "./axios";

export const doLogin = (values) => {
  return axios.post("/api/auth/login", values);
};
