import axios from "./axios";
import { getUrl } from "../helpers/url";

export const getUsers = (params) => {
  return axios.get(getUrl("/api/user/data", params));
};

export const addUser = (values) => {
  return axios.post("/api/user/add", {
    ...values,
    active: values?.active ? "true" : "false",
  });
};
