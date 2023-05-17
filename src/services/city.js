import axios from "./axios";

export const getCities = () => {
  return axios.get("/api/city/data");
};

export const addCity = (values) => {
  return axios.post("/api/city/add", {
    ...values,
    active: values?.active ? "true" : "false",
  });
};

export const removeCity = (id) => {
  return axios.delete(`/api/city/remove/${id}`);
};
