import axios from "./axios";
import { getUrl } from "../helpers/url";

export const getTransaction = (params) => {
  return axios.get(getUrl("/api/transaction/data", params));
};

export const addTransaction = (values) => {
  return axios.post("/api/transaction/add", {
    ...values,
    active: values?.active ? "true" : "false",
  });
};
