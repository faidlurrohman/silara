import axios from "./axios";
import { getUrl } from "../helpers/url";

export const getSigner = (params) => {
  return axios.get(getUrl("/api/signer/data", params));
};

export const addSigner = (values) => {
  return axios.post("/api/signer/add", {
    ...values,
    active: values?.active ? "true" : "false",
  });
};
