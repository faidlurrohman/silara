import axios from "./axios";

export const getTransaction = () => {
  return axios.get("/api/transaction/data");
};

export const addTransaction = (values) => {
  return axios.post("/api/transaction/add", {
    ...values,
    active: values?.active ? "true" : "false",
  });
};
