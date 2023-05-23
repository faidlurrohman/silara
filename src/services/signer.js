import axios from "./axios";

export const getSigner = () => {
  return axios.get("/api/signer/data");
};

export const addSigner = (values) => {
  return axios.post("/api/signer/add", {
    ...values,
    active: values?.active ? "true" : "false",
  });
};
