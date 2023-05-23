import axios from "./axios";

export const getUsers = () => {
  return axios.get("/api/user/data");
};

export const addUser = (values) => {
  return axios.post("/api/user/add", {
    ...values,
    active: values?.active ? "true" : "false",
  });
};
