import axios from "./axios";

export const getCities = () => {
  return axios.get(`/api/city/data`);
};

export const getCityList = () => {
  return axios.get(`/api/city/list`);
};

export const addCity = (values) => {
  return axios.post(`/api/city/add`, {
    ...values,
    active: values?.active ? "true" : "false",
  });
};
