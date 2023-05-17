import axios from "./axios";

export const getSigner = () => {
  return axios.get("/api/signer/data");
};

export const getSignerList = () => {
  return axios.get("/api/signer/list");
};

export const addSigner = (values) => {
  return axios.post("/api/signer/add", {
    ...values,
    active: values?.active ? "true" : "false",
  });
};

export const removeSigner = (id) => {
  return axios.delete(`/api/signer/remove/${id}`);
};
